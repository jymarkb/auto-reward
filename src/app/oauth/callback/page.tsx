// app/oauth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const verifier = sessionStorage.getItem("pkce_verifier");

    if (code && verifier) {
      fetch("/api/oauth/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, verifier })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Access token:", data);
          // ✅ store access_token in cookie/localStorage
          router.push("/dashboard");
        });
    }
  }, []);

  return <div>Authorizing...</div>;
}
