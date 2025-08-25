export const ActionAPI = async ({
  accessToken,
  targetURL,
  method,
  title,
  payload = null,
}: {
  accessToken: string;
  targetURL: string;
  method: string;
  title: string;
  payload?: object | null;
}) => {
  try {
    const res = await fetch(targetURL, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        ...(method === "POST" && payload
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body: method === "POST" && payload ? JSON.stringify(payload) : undefined,
    });

    const data = await res.json();
    if (data) {
      console.log(`✅ ${title}`);
      console.log({data: data});
    }
  } catch (err) {
    console.error(`❌ ${title}`);
    return null;
  }
};
