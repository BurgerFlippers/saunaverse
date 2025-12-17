import { env } from "@/env";
import { fetch } from "undici";

const POLAR_TOKEN_URL = "https://polarremote.com/v2/oauth2/token";
const POLAR_API_BASE_URL = "https://www.polaraccesslink.com/v3";

export async function refreshPolarToken(refreshToken: string) {
  const response = await fetch(POLAR_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${env.POLAR_CLIENT_ID}:${env.POLAR_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Polar token: ${response.statusText}`);
  }

  return (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    x_user_id: number;
  };
}

export async function registerUser(accessToken: string, userId: string) {
  const response = await fetch(`${POLAR_API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      "member-id": userId,
    }),
  });

  if (!response.ok && response.status !== 409) {
    // 409 means already registered
    throw new Error(`Failed to register user to Polar: ${response.statusText}`);
  }

  if (response.status === 200) {
      return (await response.json()) as {
        "polar-user-id": number;
        "member-id": string;
        "registration-date": string;
        "first-name": string;
        "last-name": string;
        birthdate: string;
        gender: string;
        weight: number;
        height: number;
      };
  }
}

export async function getContinuousHeartRate(
    accessToken: string,
    date: string
) {
    const response = await fetch(`${POLAR_API_BASE_URL}/users/continuous-heart-rate/${date}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            Authorization: `Bearer ${accessToken}`,
        }
    });

    if (response.status === 404) {
        return null; 
    }

    if (!response.ok) {
         throw new Error(`Failed to fetch continuous heart rate: ${response.statusText}`);
    }

    return (await response.json()) as {
        polar_user: string;
        date: string;
        heart_rate_samples: {
            heart_rate: number;
            sample_time: string;
        }[];
    };
}