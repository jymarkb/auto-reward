// utils/pkce.ts
export function base64URLEncode(str: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePKCECodes() {
  const verifier = base64URLEncode(
    crypto.getRandomValues(new Uint8Array(64)).buffer
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  const challenge = base64URLEncode(digest);
  return { verifier, challenge };
}
