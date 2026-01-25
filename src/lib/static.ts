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

export const DailyAPI = (
  tokenBody: tokenBodyType,
  activityId: string,
  bundleType: "FREE" | "PREMIUM",
  position: number
) => {
  return [
    {
      accessToken: tokenBody.access_token,
      targetURL: `https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/premium-check-in/activity/${activityId}/claim`,
      limit: 1,
      title: `Claim ${bundleType} Day ${position}`,
      payload: {
        claim_type: "EACH",
        bundle_type: bundleType,
        position: position
      },
      method: "POST",
    },
  ];
};

export const CodeClaim = (tokenBody: tokenBodyType, code: String) => {
  return [
    {
      accessToken: tokenBody.access_token,
      targetURL: `https://core-api.combo-interactive.com/me/games/5f0740de-8045-42d4-8460-b03f340f01a6/itemcodes/redeem`,
      limit: 1,
      title: "Code Claim",
      payload: {
        "game_id": "5f0740de-8045-42d4-8460-b03f340f01a6",
        "serial": code
      },
      method: "POST",
    },
  ];
}

export const ShootFranky = (tokenBody: tokenBodyType) => {
  return [
    {
      accessToken: tokenBody.access_token,
      method: "POST",
      title: "Shoot Franky",
      limit: 20,
      targetURL: "https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/tower/9047a128-1cb7-4e25-82ee-4fae553f6a88/play",
      payload: {
        tower_weapon_id: 7,
        quantity: 1
      },
    }
  ]
}

export const WheelApi = (tokenBody: tokenBodyType) => {
  return [
    {
      accessToken: tokenBody.access_token,
      method: "POST",
      title: "Wheel Game",
      limit: 1,
      targetURL: "https://activity-api.combo-interactive.com/treasure-hunter/69429ba5-862e-413e-8db5-c66e2b3ac585/play",
      payload: {
        board_type: "MAIN",
        action: "PULL_FREE"
      },
    }
  ]
}
