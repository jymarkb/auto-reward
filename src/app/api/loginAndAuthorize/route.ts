"use server";
import { load } from "cheerio";
import { request, Agent } from "undici";
import { CookieJar } from "tough-cookie";;
import crypto from "crypto";
import { URLSearchParams } from "url";
import { tokenBodyType } from "@/lib/utils";
import { DailyAPI, CodeClaim, WheelApi, JunkenAPI } from "@/lib/static";
import { ActionAPI } from "@/app/actions/Action";
import { GeneratePKCE } from "@/app/actions/Generate";
import { NextResponse } from "next/server";
import { getClaimableTargets, getPremiumCheckInIds } from "@/lib/site";

const users = ["lovekosiax", "lovekosiax1", "ezpz1x", "ezpz2x", "ezpz4x"];

export const POST = async (req: Request) => {

    const authorizeBaseUrl = "https://auth.combo-interactive.com/oauth/authorize";
    const tokenUrl = "https://auth.combo-interactive.com/oauth/token";
    const redirectUri = "https://sea-member.combocabalm.com/oauth/callback";
    const clientId = "c45febcb-fec7-4bd9-a7fc-d777758ee1dd";
    const loginUrl = "https://auth.combo-interactive.com/cabalm-sea-web/login?theme=cabalmsea";

    const jar = new CookieJar();

    const body = await req.json();
    const { username, eventCode } = body;

    if (!username || !users.includes(username)) {
        return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    }

    const browserHeaders = {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        // Intentionally request uncompressed — undici does not auto-decompress.
        "Accept-Encoding": "identity",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
    };

    const sharedAgent = new Agent({
        headersTimeout: 30000,
        bodyTimeout: 30000,
    });

    type HopResult = {
        finalUrl: string;
        statusCode: number;
        html: string;
        headers: Record<string, any>;
        stoppedAt?: string;
    };

    // Follows redirects while persisting cookies. If `stopAtPrefix` is set and a
    // redirect Location starts with it, returns immediately with that URL in
    // `stoppedAt` (used to capture the OAuth `code` without actually hitting
    // the callback endpoint).
    const fetchFollow = async (
        startUrl: string,
        opts: {
            method?: "GET" | "POST";
            body?: string;
            extraHeaders?: Record<string, string>;
            stopAtPrefix?: string;
            maxHops?: number;
        } = {}
    ): Promise<HopResult> => {
        const { method = "GET", body, extraHeaders = {}, stopAtPrefix, maxHops = 8 } = opts;
        let currentUrl = startUrl;
        let currentMethod: "GET" | "POST" = method;
        let currentBody: string | undefined = body;
        let currentExtra = { ...extraHeaders };

        for (let hop = 0; hop < maxHops; hop++) {
            const res = await request(currentUrl, {
                method: currentMethod,
                headers: {
                    ...browserHeaders,
                    ...currentExtra,
                    Cookie: await jar.getCookieString(currentUrl),
                },
                body: currentMethod === "POST" ? currentBody : undefined,
                dispatcher: sharedAgent,
            });

            const setCookie = res.headers["set-cookie"];
            if (setCookie) {
                (Array.isArray(setCookie) ? setCookie : [setCookie]).forEach((c) =>
                    jar.setCookieSync(c, currentUrl)
                );
            }

            const loc = res.headers["location"];
            const isRedirect = res.statusCode >= 300 && res.statusCode < 400 && loc;

            if (!isRedirect) {
                const html = await res.body.text();
                return { finalUrl: currentUrl, statusCode: res.statusCode, html, headers: res.headers };
            }

            await res.body.text(); // drain
            const nextRaw = Array.isArray(loc) ? loc[0] : loc!;
            const nextUrl = new URL(nextRaw, currentUrl).toString();
            console.log(`↪️  Hop ${hop + 1}: ${res.statusCode} ${currentUrl} → ${nextUrl}`);

            if (stopAtPrefix && nextUrl.startsWith(stopAtPrefix)) {
                return { finalUrl: currentUrl, statusCode: res.statusCode, html: "", headers: res.headers, stoppedAt: nextUrl };
            }

            // After 301/302/303, browsers switch to GET and drop the body.
            // 307/308 preserve the method.
            if (res.statusCode !== 307 && res.statusCode !== 308) {
                currentMethod = "GET";
                currentBody = undefined;
                // Drop POST-only headers
                delete currentExtra["Content-Type"];
                delete currentExtra["Content-Length"];
            }

            currentUrl = nextUrl;
        }
        throw new Error(`Too many redirects starting from ${startUrl}`);
    };

    // Step 1: Start the OAuth flow. The authorize endpoint sets a session
    // cookie keyed to this OAuth request, then redirects to the login page.
    const { verifier, challenge } = GeneratePKCE();
    const state = crypto.randomBytes(16).toString("hex");
    const authorizeUrl = `${authorizeBaseUrl}?client_id=${clientId}&code_challenge=${challenge}&code_challenge_method=S256&lang=en&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&response_type=code&scope=&state=${state}`;

    console.log(`🔍 Starting OAuth at ${authorizeUrl}`);
    const loginPageRes = await fetchFollow(authorizeUrl);
    const html = loginPageRes.html;
    console.log("➡️  Login page URL:", loginPageRes.finalUrl);
    console.log("➡️  Status:", loginPageRes.statusCode, "HTML length:", html.length);

    const $ = load(html);
    const csrfToken = $('input[name="_token"]').val();
    if (!csrfToken) {
        console.error("❌ CSRF token not found. Status:", loginPageRes.statusCode);
        console.error("HTML snippet:", html.slice(0, 2000));
        throw new Error("CSRF token not found");
    }

    // The form's action is the URL we POST to. Fall back to loginUrl if absent.
    const formAction = $('#form-login').attr('action') || loginUrl;
    console.log("✅ CSRF token found:", csrfToken);
    console.log("➡️  Form action:", formAction);

    // Step 2: POST login. Follow redirects until we land on the redirect_uri
    // (which carries the OAuth `code`), then stop without hitting it.
    const password = process.env.PASSWORD as string;
    const loginPayload = new URLSearchParams();
    loginPayload.append("_token", csrfToken as string);
    loginPayload.append("username", username);
    loginPayload.append("password", password);

    const postResult = await fetchFollow(formAction, {
        method: "POST",
        body: loginPayload.toString(),
        extraHeaders: {
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: new URL(formAction).origin,
            Referer: loginPageRes.finalUrl,
        },
        stopAtPrefix: redirectUri,
    });

    const codeUrl = postResult.stoppedAt;
    if (!codeUrl) {
        console.error("❌ Login did not redirect to OAuth callback. Final URL:", postResult.finalUrl);
        console.error("HTML snippet:", postResult.html.slice(0, 2000));
        throw new Error("Login failed or OAuth code not returned");
    }

    const code = new URL(codeUrl).searchParams.get("code");
    if (!code) throw new Error("No auth code returned");

    console.log("✅ Successfully Logged In + Got OAuth Code");

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

    // actionsToRun.push(...JunkenAPI(tokenBody))

    for (const element of actionsToRun) {
        if(element.limit > 0) {
            for(let i = 0; i < element.limit; i++) {
                await ActionAPI(element);
            }
        } else {
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
