import { env } from "@/env";
import { fetch } from "undici";
import { gql } from "graphql-request";

export interface HarviaApiEndpoints {
  RestApi: {
    generics: { https: string };
    data: { https: string };
    device: { https: string };
    users: { https: string };
  };
  GraphQL: {
    data: { https: string; wss: string; schemaUrl: string };
    device: { https: string; wss: string; schemaUrl: string };
    events: { https: string; wss: string; schemaUrl: string };
    users: { https: string; wss: string; schemaUrl: string };
  };
}

let harviaEndpoints: HarviaApiEndpoints | null = null;

export async function getHarviaEndpoints(): Promise<HarviaApiEndpoints> {
  if (harviaEndpoints) {
    return harviaEndpoints;
  }

  const response = await fetch("https://prod.api.harvia.io/endpoints");
  if (!response.ok) {
    throw new Error(`Failed to fetch Harvia endpoints: ${response.statusText}`);
  }

  const data = (await response.json()) as { endpoints: HarviaApiEndpoints };
  harviaEndpoints = data.endpoints;
  return harviaEndpoints;
}

export async function getHarviaIdToken(
  username: string,
  password: string,
): Promise<{
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const endpoints = await getHarviaEndpoints();
  const response = await fetch(
    `${endpoints.RestApi.generics.https}/auth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(
      error.message || `Authentication failed: ${response.status}`,
    );
  }

  return response.json() as Promise<{
    idToken: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;
}

export async function refreshHarviaIdToken(
  refreshToken: string,
  email: string,
): Promise<{ idToken: string; accessToken: string; expiresIn: number }> {
  const endpoints = await getHarviaEndpoints();
  const response = await fetch(
    `${endpoints.RestApi.generics.https}/auth/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, email }),
    },
  );

  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(
      error.message || `Token refresh failed: ${response.status}`,
    );
  }

  return response.json() as Promise<{
    idToken: string;
    accessToken: string;
    expiresIn: number;
  }>;
}

export async function harviaGraphQLRequest<
  T = any,
  V extends Record<string, any> = Record<string, any>,
>(
  service: "data" | "device" | "events" | "users",
  query: string,
  variables: V,
  idToken: string,
  operationName: string,
): Promise<T> {
  const endpoints = await getHarviaEndpoints();
  const graphqlEndpoint = endpoints.GraphQL[service].https;

  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),
  });

  console.log(
    JSON.stringify({
      query,
      variables,
      operationName,
    }),
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`GraphQL request failed (${operationName}): ${errorText}`);
    throw new Error(`GraphQL request failed: ${response.status} ${errorText}`);
  }

  const result = (await response.json()) as { data: T; errors?: any[] };

  if (result.errors) {
    console.error(`GraphQL errors (${operationName}):`, result.errors);
    console.error(response.headers);
    console.error(response.url);
    throw new Error(
      `GraphQL errors: ${result.errors[0]?.message || "Unknown error"}`,
    );
  }

  return result.data;
}

// Example GraphQL Queries (to be used with harviaGraphQLRequest)

// Query to list user's devices
export const GET_USER_DEVICES_QUERY = gql`
  query usersDevicesList {
    usersDevicesList {
      devices {
        id
        type
        attr {
          key
          value
        }
      }
      nextToken
    }
  }
`;

// Query to list device sessions
export const GET_DEVICE_SESSIONS_QUERY = gql`
  query devicesSessionsList(
    $deviceId: String!
    $startTimestamp: AWSDateTime!
    $endTimestamp: AWSDateTime!
  ) {
    devicesSessionsList(
      deviceId: $deviceId
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
    ) {
      sessions {
        deviceId
        sessionId
        organizationId
        subId
        timestamp
        type
        durationMs
        stats
      }
      nextToken
    }
  }
`;

// Query to get device measurements for a session
export const GET_DEVICE_MEASUREMENTS_QUERY = gql`
  query devicesMeasurementsList(
    $deviceId: String!
    $startTimestamp: String!
    $endTimestamp: String!
    $samplingMode: SamplingMode
    $sampleAmount: Int
    $nextToken: String
    $db: DatabaseType
  ) {
    devicesMeasurementsList(
      deviceId: $deviceId
      startTimestamp: $startTimestamp
      endTimestamp: $endTimestamp
      samplingMode: $samplingMode
      sampleAmount: $sampleAmount
      nextToken: $nextToken
      db: $db
    ) {
      measurementItems {
        ...measurementItemFields
        __typename
      }
      nextToken
      __typename
    }
  }
  fragment measurementItemFields on MeasurementItem {
    deviceId
    subId
    timestamp
    sessionId
    type
    data
    __typename
  }
`;
