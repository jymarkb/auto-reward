import crypto from "crypto";
export const GeneratePKCE = () => {
  const verifier = crypto.randomBytes(64).toString("hex");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest()
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return { verifier, challenge };
};
