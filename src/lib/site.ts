"use server";
import { request } from "undici";

const APP_ID = "5f0740de-8045-42d4-8460-b03f340f01a6";
const API_URL = `https://activity-api-v3.combo-interactive.com/${APP_ID}/premium-check-in/activities`;

interface ClaimTarget {
    activityId: string;
    bundleType: "FREE" | "PREMIUM";
    position: number;
}

export const getPremiumCheckInIds = async (accessToken: string): Promise<string[]> => {
    console.log(`🔍 Fetching Event List from API...`);

    const res = await request(API_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });

    if (res.statusCode !== 200) {
        console.error(`❌ API Error: ${res.statusCode}`);
        console.log(await res.body.text());
        throw new Error("Failed to fetch event list API");
    }

    const response = await res.body.json() as any;
    const events = response.data || [];

    if (events.length === 0) {
        console.warn("⚠️ API returned 0 events.");
        return [];
    }

    const now = new Date();
    const activeIds = events
        .filter((e: any) => {
            if (e.is_enabled === 0) return false;
            const start = new Date(e.start_at);
            const end = new Date(e.end_at);
            return now >= start && now <= end;
        })
        .map((e: any) => e.id);

    console.log(`🎯 Found ${activeIds.length} Active Event IDs:`, activeIds);

    return activeIds;
};


interface ClaimTarget {
    activityId: string;
    bundleType: "FREE" | "PREMIUM";
    position: number;
}

export const getClaimableTargets = async (accessToken: string, activityId: string): Promise<ClaimTarget[]> => {
    const BUNDLES_URL = `https://activity-api-v3.combo-interactive.com/5f0740de-8045-42d4-8460-b03f340f01a6/premium-check-in/activity/${activityId}/bundles`;

    console.log(`🔍 Checking progress for Event: ${activityId}...`);

    const res = await request(BUNDLES_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json"
        }
    });

    if (res.statusCode !== 200) return [];

    const json = await res.body.json() as any;
    const targets: ClaimTarget[] = [];
    if (json.data?.free) {
        // Find the first item where "claimed" array is empty
        const nextFree = json.data.free.find((b: any) => b.claimed.length === 0);
        if (nextFree) {
            targets.push({ activityId, bundleType: "FREE", position: nextFree.position });
        }
    }

    if (json.data?.premium) {
        const nextPremium = json.data.premium.find((b: any) => b.claimed.length === 0);
        if (nextPremium) {
            targets.push({ activityId, bundleType: "PREMIUM", position: nextPremium.position });
        }
    }

    return targets;
};