const claimActivity = async ({
  activityId,
  accessToken,
  locale = "en", // default locale
}: {
  activityId: string;
  accessToken: string;
  locale?: string;
}) => {
  const url = `https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/premium-check-in/activity/${activityId}/claim`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept-Language": locale,
    },
    body: JSON.stringify({
      claim_type: "EACH",
      bundle_type: "FREE",
    }),
  });

  if (!response.ok) {
    throw new Error(`Claim failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data)
};

export default claimActivity;
