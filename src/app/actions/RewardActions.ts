"use server";
import { request } from "undici";
import { CookieJar } from "tough-cookie";
import { load } from "cheerio";
import { URL } from "url";

const jar = new CookieJar();

const Login = async () => {
  const loginUrl = "https://auth.combo-interactive.com/cabalmsea/login";
  const redirectUri = "https://sea-member.combocabalm.com/oauth/callback";

  // Step 1: GET login page
  const loginPageRes = await request(loginUrl);
  const html = await loginPageRes.body.text();
  const $ = load(html);
  const csrfToken = $('input[name="_token"]').val();

  if (!csrfToken) throw new Error("❌ CSRF token not found");

  // Save cookies
  const cookies = loginPageRes.headers["set-cookie"] ?? [];
  (Array.isArray(cookies) ? cookies : [cookies]).forEach(cookie => {
    jar.setCookieSync(cookie, loginUrl);
  });

  // Step 2: POST login
  const formData = new URLSearchParams();
  formData.append("_token", csrfToken as string);
  formData.append("username", "your-username");
  formData.append("password", "your-password");

  const loginRes = await request(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": await jar.getCookieString(loginUrl),
      "User-Agent": "Mozilla/5.0",
      "Referer": loginUrl,
      "Origin": "https://auth.combo-interactive.com",
    },
    body: formData.toString(),
    maxRedirections: 0,
  });

  const location = loginRes.headers["location"];

  if (!location) {
    console.log("❌ No redirect after login");
    return;
  }

  // Step 3: Follow redirect chain manually to reach the final `?code=...`
  let currentUrl = location;
  let maxRedirects = 5;

  while (maxRedirects-- > 0) {
    const res = await request(currentUrl, {
      method: "GET",
      headers: {
        Cookie: await jar.getCookieString(currentUrl),
      },
      maxRedirections: 0,
    });

    const nextLocation = res.headers["location"];

    if (!nextLocation) {
      // Possibly final destination
      const urlObj = new URL(currentUrl);
      const code = urlObj.searchParams.get("code");
      if (code) {
        console.log("✅ Extracted code:", code);
        return code;
      } else {
        console.log("❌ No ?code param found in:", currentUrl);
        return;
      }
    }

    currentUrl = nextLocation;
  }

  console.log("❌ Too many redirects or did not reach code callback");
};

export default Login;
