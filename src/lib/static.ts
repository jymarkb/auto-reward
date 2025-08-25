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
    const activityId = "0721d7f6-da3b-4766-bc4f-08215a22e684";
    const activityId2 = "190c9fc1-e996-42d6-9cc8-3af9566c743d";
    
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
    {
      accessToken: tokenBody.access_token,
      targetURL: `https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/premium-check-in/activity/${activityId2}/claim`,
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

export const ShootFranky = (tokenBody:tokenBodyType) => {
  return [
    {
      accessToken: tokenBody.access_token,
      method: "POST",
      title: "Shoot Franky",
      limit: 20,
      targetURL:"https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/tower/9047a128-1cb7-4e25-82ee-4fae553f6a88/play",
      payload: {
        tower_weapon_id: 7,
        quantity: 1
      },
    }
  ]
}

export const WheelApi = (tokenBody:tokenBodyType) => {
  return [
    {
      accessToken: tokenBody.access_token,
      method: "POST",
      title: "Wheel Game",
      limit: 1,
      targetURL:"https://activity-api.combo-interactive.com/treasure-hunter/69429ba5-862e-413e-8db5-c66e2b3ac585/play",
      payload: {
        board_type: "MAIN",
        action: "PULL_FREE"
      },
    }
  ]
}
