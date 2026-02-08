"use server";
import { load } from "cheerio";
import { request, Agent } from "undici";
import { CookieJar } from "tough-cookie";;
import crypto from "crypto";
import { URLSearchParams } from "url";
import { tokenBodyType } from "@/lib/utils";
import { DailyAPI, CodeClaim, WheelApi } from "@/lib/static";
import { ActionAPI } from "@/app/actions/Action";
import { GeneratePKCE } from "@/app/actions/Generate";
import { NextResponse } from "next/server";
import { getClaimableTargets, getPremiumCheckInIds } from "@/lib/site";

const users = ["lovekosiax", "lovekosiax1", "ezpz1x", "ezpz2x", "ezpz4x"];

export const POST = async (req: Request) => {

    const authorizeBaseUrl = "https://auth.combo-interactive.com/oauth/authorize";
    const tokenUrl = "https://auth.combo-interactive.com/oauth/token";
    const redirectUri = "https://sea-member.combocabalm.com/oauth/callback";
    const clientId = "c45febcb-fec7-4bd9-a7fc-d777758ee1dd"; ``
    const loginUrl = "https://auth.combo-interactive.com/cabalm-sea-web/login";

    const jar = new CookieJar();

    const body = await req.json();
    const { username, eventCode } = body;

    if (!username || !users.includes(username)) {
        return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    }

    // Step 1: Get CSRF token
    console.log(`🔍 Fetching ${loginUrl} ...`);
    const loginPage = await request(loginUrl, {
        method: "GET",
        dispatcher: new Agent({
            headersTimeout: 30000, // 30s header wait
            bodyTimeout: 30000     // 30s body wait
        })
    });

    const html = await loginPage.body.text();
    const $ = load(html);
    const csrfToken = $('input[name="_token"]').val();
    if (!csrfToken) throw new Error("CSRF token not found");

    const setCookies = loginPage.headers["set-cookie"];
    if (setCookies) {
        (Array.isArray(setCookies) ? setCookies : [setCookies]).forEach((c) =>
            jar.setCookieSync(c, loginUrl)
        );
    }

    console.log("✅ CSRF token found:", csrfToken);

    // Step 2: POST login form
    const password = process.env.PASSWORD as string;
    const loginPayload = new URLSearchParams();
    loginPayload.append("_token", csrfToken as string);
    loginPayload.append("username", username);
    loginPayload.append("password", password);

    const loginRes = await request(loginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: await jar.getCookieString(loginUrl),
        },
        body: loginPayload.toString()
    });

    const postCookies = loginRes.headers["set-cookie"];
    if (postCookies) {
        (Array.isArray(postCookies) ? postCookies : [postCookies]).forEach((c) =>
            jar.setCookieSync(c, loginUrl)
        );
    }

    console.log("✅ Successfuly Login");

    // Step 3: GET /oauth/authorize
    const { verifier, challenge } = GeneratePKCE();
    const state = crypto.randomBytes(16).toString("hex");
    const authorizeUrl = `${authorizeBaseUrl}?client_id=${clientId}&code_challenge=${challenge}&code_challenge_method=S256&lang=en&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&response_type=code&scope=&state=${state}`;

    const authPage = await request(authorizeUrl, {
        method: "GET",
        headers: {
            Cookie: await jar.getCookieString(authorizeUrl),
        },
    });

    const location = authPage.headers["location"];
    if (!location || !location.includes("code=")) {
        throw new Error("Failed to retrieve authorization code");
    }

    const url = Array.isArray(location) ? location[0] : location;
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get("code");

    if (!code) throw new Error("No auth code returned");

    console.log("✅ Get OAuth Code");

    // ✅ Step 4: Exchange code for token
    const tokenPayload = new URLSearchParams();
    tokenPayload.append("grant_type", "authorization_code");
    tokenPayload.append("client_id", clientId);
    tokenPayload.append("redirect_uri", redirectUri);
    tokenPayload.append("code_verifier", verifier);
    tokenPayload.append("code", code);

    const tokenRes = await request(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenPayload.toString(),
    });

    // Always parse the body first
    const tokenBody = (await tokenRes.body.json()) as tokenBodyType;

    // Check for HTTP error *after* parsing
    if (tokenRes.statusCode !== 200) {
        console.error("❌ Token Error:", tokenBody);
        throw new Error("Failed to exchange code for token");
    }

    console.log("✅ Token Generated");

    let actionsToRun = [];

    const multiEvent = eventCode.length > 0 ? eventCode.split(",") : [];
    if (multiEvent.length) {
        for (const listCode of multiEvent) {
            actionsToRun.push(...CodeClaim(tokenBody, listCode));
        }
    }

    else {
        // START GET ALL ACTIVE DAILY
        const activityIds = await getPremiumCheckInIds(tokenBody.access_token);


        for (const id of activityIds) {
            const targets = await getClaimableTargets(tokenBody.access_token, id);
            for (const target of targets) {
                actionsToRun.push(
                    ...DailyAPI(tokenBody, target.activityId, target.bundleType, target.position)
                );
            }
        }
        // END GET ALL ACTIVE DAILY

        // ADD HERE OTHER ACTION
    }

    actionsToRun.push(...WheelApi(tokenBody))

    for (const element of actionsToRun) {
        if (element.limit > 0) {
            await ActionAPI(element);
        }
    }

    return NextResponse.json(
        {
            success: true,
            message: {
                message: "Claim Reward",
                username: username,
                _token: csrfToken
            }
        },
        { status: 200 }
    );
};
