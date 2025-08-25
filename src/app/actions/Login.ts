import { load } from "cheerio";
import { request } from "undici";
import { CookieJar } from "tough-cookie";

export const Login = async (formData: FormData) => {
  const loginUrl = "https://auth.combo-interactive.com/cabalmsea/login";
  const jar = new CookieJar();

  const username = formData.get("username") as string;
  if (!username) throw new Error("Missing credentials");

  // Step 1: Get CSRF token
  const loginPage = await request(loginUrl, { method: "GET" });
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
};
