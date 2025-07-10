import { JunkenRequest, tokenBodyType } from "./utils";

export const JunkenAPI = (tokenBody: tokenBodyType): JunkenRequest[] => {
  return [
    {
      accessToken: tokenBody.access_token,
      targetURL:
        "https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/rps/775b23f0-00a9-4b46-b60e-bffaee134329/board?board_type=PRINCE",
      limit: 1,
      title: "Board Data",
      payload: null,
      method: "GET",
    },
    {
      accessToken: tokenBody.access_token,
      targetURL:
        "https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/rps/775b23f0-00a9-4b46-b60e-bffaee134329/board/start?board_type=PRINCE",
      limit: 1,
      title: "Start Junken",
      payload: null,
      method: "POST",
    },
    {
      accessToken: tokenBody.access_token,
      targetURL:
        "https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/rps/775b23f0-00a9-4b46-b60e-bffaee134329/board/play?board_type=PRINCE",
      limit: 5,
      title: "Play Junken",
      payload: {
        choose: "SCISSORS",
      },
      method: "POST",
    },
    {
      accessToken: tokenBody.access_token,
      targetURL:
        "https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/rps/775b23f0-00a9-4b46-b60e-bffaee134329/board/claim?board_type=PRINCE",
      limit: 1,
      title: "Claim Junken",
      payload: null,
      method: "POST",
    },
  ];
};

export const DailyAPI = (tokenBody: tokenBodyType) => {
    const activityId = "8326a07e-9758-4c3e-9e23-a34ff57b52cc"
  return [
    {
      accessToken: tokenBody.access_token,
      targetURL: `https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/premium-check-in/activity/${activityId}/claim`,
      limit: 1,
      title: "Daily Claim",
      payload: {
        claim_type: "EACH",
        bundle_type: "FREE",
      },
      method: "POST",
    },
  ];
};
