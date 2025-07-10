// app/api/oauth/exchange/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, verifier } = await req.json();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: "c45febcb-fec7-4bd9-a7fc-d777758ee1dd",
    redirect_uri: "https://sea-member.combocabalm.com/oauth/callback",
    code_verifier: verifier,
    code
  });

  const response = await fetch("https://auth.combo-interactive.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const token = await response.json();
  return NextResponse.json(token);
}
