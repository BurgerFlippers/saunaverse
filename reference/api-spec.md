# MyHarvia Logo MyHarvia Cloud API Specification

GraphQL AWS TypeScript

    Harvia API — Initial Release, v 0.5.0 - 031125
    We’re publishing the first public release of the Harvia API. This is an early developer release: we invite you to explore, integrate, and provide feedback.
    The API will continue to evolve as we add capabilities and add schemas. We are also evaluating alternative API approaches — including MQTT-based communication, AI-compatible data interfaces, and other modern integration models. Our goal is to ensure long-term interoperability, efficiency, and ease of use across both embedded and cloud environments. We strive to maintain backward compatibility; when changes are necessary, we will announce them in advance and provide clear migration guidance through our documentation and changelog.

📋 Overview

This document covers the MyHarvia Cloud API specification with 3 services and their APIs, authentication setup, and configuration.

    Authentication - REST API authentication and JWT token management via the public REST API
    API Services:
        Data Service - Device measurements and session data (REST API + GraphQL)
        Device Service - Device management and control (REST API + GraphQL)
        Events Service - Event monitoring and notifications (GraphQL)

API Types:

    REST API - RESTful endpoints for specific operations (available in Data & Device Services)
    GraphQL - Query, mutation, and subscription operations (available in all services)

Available Endpoints:

    REST API endpoints - Standard HTTP REST endpoints (Data & Device Services)
    GraphQL HTTPS endpoint - For standard GraphQL queries and mutations (all services)
    GraphQL WebSocket endpoint - For real-time GraphQL subscriptions (all services)
    GraphQL Schema URL - For downloading the GraphQL schema (all services)

📋 REST API Operations
🔐 Authentication
Endpoint Method Description
/auth/token POST Username & password-based login, returns tokens (valid for 1 hour) for API access
/auth/refresh POST Refresh tokens to extend API access
/auth/revoke POST Revoke refresh tokens
🔧 Device Service
Endpoint Method Description
/devices GET List user's devices
/devices/command POST Send command to a device
/devices/state GET Get device state (shadow)
/devices/target PATCH Set target temperature & humidity
/devices/profile PATCH Change device profile
📊 Data Service
Endpoint Method Description
/data/latest-data GET Get latest telemetry data
/data/telemetry-history GET Get telemetry history for a time range
🔐 Authentication

The APIs use AWS Cognito for authentication via JWT tokens. All API endpoints require JWT token authentication. Authentication is handled through the public REST API which provides token endpoints.
Authorization Type Description Usage
JWT Token Cognito authentication via REST API All API access

Fetch API configuration first to obtain the REST API base URL and GraphQL endpoints. Use the REST API /auth/token endpoint to obtain JWT tokens.
🌐 API Endpoint Configuration

Endpoint: https://prod.api.harvia.io/endpoints

This endpoint returns the values required for authentication and service requests.

API Response Example:

{
"endpoints": {
"RestApi": {
"generics": {
"https": "https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod"
},
"data": {
"https": "https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod"
},
"device": {
"https": "https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod"
},
"users": {
"https": "https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod"
}
},
"version": "6.31.2",
"Config": {
"IoTCoreCredentialsEndpoint": "c9d0zb4dt5fpm.credentials.iot.eu-central-1.amazonaws.com",
"UserPoolId": "eu-central-1_PYox3qeLn",
"Region": "eu-central-1",
"AnalyticsDashboardId": "",
"IdentityPoolId": "eu-central-1:c6b64717-a29e-4695-8ce4-97c93470da8a",
"IotCoreEndpoint": "ab4fm8yv2cf3g-ats.iot.eu-central-1.amazonaws.com",
"PinpointAnalyticsLevel": "medium",
"AuthType": "AMAZON_COGNITO_USER_POOLS",
"Clients": [
{
"name": "harvia-eos-generics-harvia-client",
"id": "1cq6ttro3ug8u0h2qbu9ltjb7o"
},
{
"name": "harvia-eos-generics-eos-client",
"id": "2m6409shai9f9isotj1jhstcfp"
},
{
"name": "harvia-eos-generics-eos-web-client",
"id": "u3rf9f4n4bec1eouni4nc1e7t"
}
],
"Urls": {
"eos": {
"eula": {
"en": "https://cdn.harvia.io/legal/harvia/eula/en.html"
},
"privacyPolicy": {
"en": "https://cdn.harvia.io/legal/harvia/privacyPolicy/en.html"
},
"termsOfUse": {
"en": "https://cdn.harvia.io/legal/harvia/termsOfUse/en.html"
}
},
"harvia": {
"eula": {
"en": "https://cdn.harvia.io/legal/harvia/eula/en.html"
},
"privacyPolicy": {
"en": "https://cdn.harvia.io/legal/harvia/privacyPolicy/en.html"
},
"termsOfUse": {
"en": "https://cdn.harvia.io/legal/harvia/termsOfUse/en.html"
}
},
"termsOfUse": "https://www.harvia.com/en/legal-disclaimer/",
"privacyPolicy": "https://www.harvia.com/en/privacy-notice/"
},
"PinpointAnalyticsProjectId": "c14a452512604dc89241987f873d14d3"
},
"DataPipeline": {
"TelemetryIngestionEndpoint": "https://firehose.eu-central-1.amazonaws.com",
"TelemetryIngestionRole": "harvia-eos-device-prod-telemetry-access-role-alias",
"TelemetryIngestionStream": "harvia-eos-data-prod-sensor-data"
},
"GraphQL": {
"payment": {
"wss": "wss://2bmloen445dojlgqfnw7b4kabu.appsync-realtime-api.eu-central-1.amazonaws.com/graphql",
"https": "https://2bmloen445dojlgqfnw7b4kabu.appsync-api.eu-central-1.amazonaws.com/graphql",
"schemaUrl": "https://appsync.eu-central-1.amazonaws.com/v1/apis/tb3cpryf7rdsndf2mzv6yq5n3u/schema?format=SDL&includeDirectives=false"
},
"data": {
"wss": "wss://b6ypjrrojzfuleunmrsysp7aya.appsync-realtime-api.eu-central-1.amazonaws.com/graphql",
"https": "https://b6ypjrrojzfuleunmrsysp7aya.appsync-api.eu-central-1.amazonaws.com/graphql",
"schemaUrl": "https://appsync.eu-central-1.amazonaws.com/v1/apis/rbancp257bfvxgvfxvbkvsicne/schema?format=SDL&includeDirectives=false"
},
"device": {
"wss": "wss://6lhlukqhbzefnhad2qdyg2lffm.appsync-realtime-api.eu-central-1.amazonaws.com/graphql",
"https": "https://6lhlukqhbzefnhad2qdyg2lffm.appsync-api.eu-central-1.amazonaws.com/graphql",
"schemaUrl": "https://appsync.eu-central-1.amazonaws.com/v1/apis/25ttxxioj5dv3de5qd642yx24m/schema?format=SDL&includeDirectives=false"
},
"stats": {
"wss": "wss://2y6n4pgr6nbmddojwqrsrxhfnq.appsync-realtime-api.eu-central-1.amazonaws.com/graphql",
"https": "https://2y6n4pgr6nbmddojwqrsrxhfnq.appsync-api.eu-central-1.amazonaws.com/graphql",
"schemaUrl": "https://appsync.eu-central-1.amazonaws.com/v1/apis/mes4eduz6fcfhbevwdsxf5zqpm/schema?format=SDL&includeDirectives=false"
},
"events": {
"wss": "wss://ykn3dsmrrvc47lnzh5vowxevb4.appsync-realtime-api.eu-central-1.amazonaws.com/graphql",
"https": "https://ykn3dsmrrvc47lnzh5vowxevb4.appsync-api.eu-central-1.amazonaws.com/graphql",
"schemaUrl": "https://appsync.eu-central-1.amazonaws.com/v1/apis/awpp6u5r2vccll45cecflkjfo4/schema?format=SDL&includeDirectives=false"
},
"users": {
"wss": "wss://qizruaso4naexbnzmmp2cokenq.appsync-realtime-api.eu-central-1.amazonaws.com/graphql",
"https": "https://qizruaso4naexbnzmmp2cokenq.appsync-api.eu-central-1.amazonaws.com/graphql",
"schemaUrl": "https://appsync.eu-central-1.amazonaws.com/v1/apis/szgak53ljbamvcpxcda62c62j4/schema?format=SDL&includeDirectives=false"
}
},
"LoggingConfig": {
"LoggingMode": 0
}
}
}

🌐 Getting the Endpoints Programmatically

You can fetch the endpoints programmatically using a simple HTTP GET request. The response structure matches the API Response Example shown above.
🟨 JavaScript/fetch

const response = await fetch("https://prod.api.harvia.io/endpoints");
const data = await response.json();
console.log(data);
// Response:
// {
// "endpoints": {
// "RestApi": {
// "generics": { "https": "https://..." },
// "users": { "https": "https://..." },
// ...
// },
// "version": "6.41.0",
// "Config": { ... },
// "GraphQL": { ... },
// ...
// }
// }

🐍 Python/requests

import requests

response = requests.get("https://prod.api.harvia.io/endpoints")
data = response.json()
print(data)

# Response:

# {

# "endpoints": {

# "RestApi": {

# "generics": { "https": "https://..." },

# "users": { "https": "https://..." },

# ...

# },

# "version": "6.41.0",

# "Config": { ... },

# "GraphQL": { ... },

# ...

# }

# }

🔧 cURL

curl -sS "https://prod.api.harvia.io/endpoints" | jq '.'

# Response:

# {

# "endpoints": {

# "RestApi": {

# "generics": { "https": "https://..." },

# "users": { "https": "https://..." },

# ...

# },

# "version": "6.41.0",

# "Config": { ... },

# "GraphQL": { ... },

# ...

# }

# }

🎫 JWT Token Authentication

For API access, you need to authenticate and obtain a JWT token using the public REST API. The IdToken must be included in the Authorization header of all your requests.
🔑 Obtaining JWT Token

Use the REST API /auth/token endpoint to authenticate and obtain JWT tokens:
🟨 JavaScript/fetch

async function getApiConfiguration() {
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiBaseUrl = endpoints.RestApi.generics.https;

return {
restApiBaseUrl,
};
}

async function signInAndGetIdToken(username, password) {
try {
const config = await getApiConfiguration();
const response = await fetch(`${config.restApiBaseUrl}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, password }),
});

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Authentication failed: ${response.status}`);
    }

    const tokens = await response.json();
    return {
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };

} catch (error) {
console.error("Authentication error:", error);
throw error;
}
}

// Usage
const tokens = await signInAndGetIdToken("your-username", "your-password");
console.log("ID Token:", tokens.idToken);

🐍 Python/requests

import requests

def get_api_configuration():
response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_base_url = endpoints["RestApi"]["generics"]["https"]

    return {
        "rest_api_base_url": rest_api_base_url,
    }

def sign_in_and_get_id_token(username: str, password: str) -> dict:
config = get_api_configuration()
response = requests.post(
f"{config['rest_api_base_url']}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": username, "password": password}
)

    if not response.ok:
        error = response.json()
        raise Exception(error.get("message", f"Authentication failed: {response.status_code}"))

    tokens = response.json()
    return {
        "id_token": tokens["idToken"],
        "access_token": tokens["accessToken"],
        "refresh_token": tokens["refreshToken"],
        "expires_in": tokens["expiresIn"],
    }

# Usage

tokens = sign_in_and_get_id_token("your-username", "your-password")
print(f"ID Token: {tokens['id_token']}")

🔧 cURL

# First, get the REST API base URL from the endpoints API

REST_API_BASE=$(curl -sS "https://prod.api.harvia.io/endpoints" | jq -r '.endpoints.RestApi.generics.https')

# Authenticate and get tokens

curl -sS -H "Content-Type: application/json" \
 -X POST "$REST_API_BASE/auth/token" \
 --data '{"username":"your-username","password":"your-password"}'

# The response contains: { "idToken": "...", "accessToken": "...", "refreshToken": "...", "expiresIn": 3600 }

Note: Save the idToken from the response to use in the Authorization: Bearer <idToken> header for API requests.
🔄 Refreshing JWT Token

JWT tokens expire after 1 hour. For long-running applications, you'll need to refresh tokens to maintain API access. Use the REST API /auth/refresh endpoint to obtain new tokens.
🟨 JavaScript/fetch

async function refreshIdToken(refreshToken, email) {
try {
const config = await getApiConfiguration();
const response = await fetch(`${config.restApiBaseUrl}/auth/refresh`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ refreshToken, email }),
});

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Token refresh failed: ${response.status}`);
    }

    const tokens = await response.json();
    return {
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    };

} catch (error) {
console.error("Token refresh error:", error);
throw error;
}
}

// Usage
// After initial sign-in, store the refreshToken
const initialTokens = await signInAndGetIdToken("your-username", "your-password");

// Later, when token expires (after ~1 hour)
const newTokens = await refreshIdToken(initialTokens.refreshToken, "your-username");
// Use newTokens.idToken for API requests

🐍 Python/requests

def refresh_id_token(refresh_token: str, email: str) -> dict:
config = get_api_configuration()
response = requests.post(
f"{config['rest_api_base_url']}/auth/refresh",
headers={"Content-Type": "application/json"},
json={"refreshToken": refresh_token, "email": email}
)

    if not response.ok:
        error = response.json()
        raise Exception(error.get("message", f"Token refresh failed: {response.status_code}"))

    tokens = response.json()
    return {
        "id_token": tokens["idToken"],
        "access_token": tokens["accessToken"],
        "expires_in": tokens["expiresIn"],
    }

# Usage

# After initial sign-in, store the refresh_token

initial_tokens = sign_in_and_get_id_token("your-username", "your-password")

# Later, when token expires (after ~1 hour)

new_tokens = refresh_id_token(initial_tokens["refresh_token"], "your-username")

# Use new_tokens["id_token"] for API requests

🔧 cURL

# Get REST API base URL (if not already set)

REST_API_BASE=$(curl -sS "https://prod.api.harvia.io/endpoints" | jq -r '.endpoints.RestApi.generics.https')

# Refresh tokens using the refresh token from initial authentication

curl -sS -H "Content-Type: application/json" \
 -X POST "$REST_API_BASE/auth/refresh" \
 --data '{"refreshToken":"<refreshToken>","email":"your-username"}'

# The response contains: { "idToken": "...", "accessToken": "...", "expiresIn": 3600 }

🔒 Revoking Refresh Token

You can revoke a refresh token to invalidate it and prevent future token refreshes. Use the REST API /auth/revoke endpoint.

Note: Revoking a refresh token does not invalidate existing ID tokens; they remain valid until expiry.
🟨 JavaScript/fetch

async function revokeRefreshToken(refreshToken, email) {
try {
const config = await getApiConfiguration();
const response = await fetch(`${config.restApiBaseUrl}/auth/revoke`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ refreshToken, email }),
});

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Token revocation failed: ${response.status}`);
    }

    const result = await response.json();
    return result;

} catch (error) {
console.error("Token revocation error:", error);
throw error;
}
}

// Usage
// After initial sign-in, store the refreshToken
const initialTokens = await signInAndGetIdToken("your-username", "your-password");

// Later, revoke the refresh token
await revokeRefreshToken(initialTokens.refreshToken, "your-username");
// Returns: { "success": true }

🐍 Python/requests

def revoke_refresh_token(refresh_token: str, email: str) -> dict:
config = get_api_configuration()
response = requests.post(
f"{config['rest_api_base_url']}/auth/revoke",
headers={"Content-Type": "application/json"},
json={"refreshToken": refresh_token, "email": email}
)

    if not response.ok:
        error = response.json()
        raise Exception(error.get("message", f"Token revocation failed: {response.status_code}"))

    return response.json()

# Usage

# After initial sign-in, store the refresh_token

initial_tokens = sign_in_and_get_id_token("your-username", "your-password")

# Later, revoke the refresh token

result = revoke_refresh_token(initial_tokens["refresh_token"], "your-username")

# Returns: { "success": True }

🔧 cURL

# Get REST API base URL (if not already set)

REST_API_BASE=$(curl -sS "https://prod.api.harvia.io/endpoints" | jq -r '.endpoints.RestApi.generics.https')

# Revoke refresh token

curl -sS -H "Content-Type: application/json" \
 -X POST "$REST_API_BASE/auth/revoke" \
 --data '{"refreshToken":"<refreshToken>","email":"your-username"}'

# The response contains: { "success": true }

🔤 Scalar Types

Common GraphQL scalar types used across all services:
Type Description Example
String Standard string type "device-123"
Int Integer number 42
Float Floating-point number 3.14
ID Unique identifier "abc123"
AWSDateTime AWS datetime scalar (ISO 8601 format) "2025-01-01T00:00:00.000Z"
AWSJSON AWS JSON scalar (JSON as string) "{\"temp\": 80}"
📦 Complete Example

End-to-end: fetch configuration, authenticate via REST API to obtain an IdToken, then call a service.
🟨 JavaScript/fetch

async function getApiConfiguration() {
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiBaseUrl = endpoints.RestApi.generics.https;

return {
restApiBaseUrl,
graphql: endpoints.GraphQL,
};
}

async function signInAndGetIdToken(username, password) {
try {
const config = await getApiConfiguration();
const response = await fetch(`${config.restApiBaseUrl}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, password }),
});

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Authentication failed: ${response.status}`);
    }

    const tokens = await response.json();
    return {
      idToken: tokens.idToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };

} catch (error) {
console.error("Authentication error:", error);
throw error;
}
}

// Perform a GraphQL POST to a service endpoint
async function makeGraphQLRequest() {
const config = await getApiConfiguration();
const tokens = await signInAndGetIdToken("your-username", "your-password");
console.log("ID Token:", tokens.idToken);

await fetch(config.graphql.data.https, {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${tokens.idToken}`
},
body: JSON.stringify({ query: "<your GraphQL query>", variables: { /_ ... _/ } })
});
// See individual service docs (data/device/events) for concrete queries.
}

makeGraphQLRequest();

🐍 Python/requests

import requests

def get_api_configuration():
response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_base_url = endpoints["RestApi"]["generics"]["https"]

    return {
        "rest_api_base_url": rest_api_base_url,
        "graphql": endpoints["GraphQL"],
    }

def sign_in_and_get_id_token(username: str, password: str) -> dict:
config = get_api_configuration()
response = requests.post(
f"{config['rest_api_base_url']}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": username, "password": password}
)

    if not response.ok:
        error = response.json()
        raise Exception(error.get("message", f"Authentication failed: {response.status_code}"))

    tokens = response.json()
    return {
        "id_token": tokens["idToken"],
        "access_token": tokens["accessToken"],
        "refresh_token": tokens["refreshToken"],
        "expires_in": tokens["expiresIn"],
    }

# Perform a GraphQL POST to a service endpoint

config = get_api_configuration()
tokens = sign_in_and_get_id_token("your-username", "your-password")
print(f"ID Token: {tokens['id_token']}")

requests.post(
config["graphql"]["data"]["https"],
headers={
"Content-Type": "application/json",
"Authorization": f"Bearer {tokens['id_token']}",
},
json={"query": "<your GraphQL query>", "variables": {}}
)

# See individual service docs (data/device/events) for concrete queries.

🔧 cURL

# 1. Get REST API base URL and GraphQL endpoint

ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_BASE=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')
GRAPHQL_DATA=$(echo "$ENDPOINTS" | jq -r '.endpoints.GraphQL.data.https')

# 2. Authenticate and get tokens

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_BASE/auth/token" \
 --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')
echo "ID Token: $ID_TOKEN"

# 3. Make a GraphQL request

curl -sS -H "Content-Type: application/json" \
 -H "Authorization: Bearer $ID_TOKEN" \
  -X POST "$GRAPHQL_DATA" \
 --data '{"query":"<your GraphQL query>","variables":{}}'

# See individual service docs (data/device/events) for concrete queries.

🌍 Configuration Reference: Harvia Endpoints API

📝 Note: Always fetch the latest configuration to ensure you're using the current REST API and GraphQL endpoints. The configuration may change over time.

🔧 Device Service

    🚀 Built for: Remote device management, configuration, and over-the-air updates
    🔧 Tech Stack: GraphQL, AWS Lambda, AWS IAM, Amazon Cognito
    📊 Data Sources: AWS IoT Core, Amazon S3, Amazon SNS

🏷️ Enums
🔧 Commands

Device control commands:
Value Description Use Case
ADJUST_DURATION ⏱️ Adjust session duration Session control
REMAINING_TIME ⏰ Get remaining time Status queries
AFTER_HEATER 🔥 Control after-heater Temperature management
EXT_SWITCH 🔌 External switch control Hardware control
FAN 💨 Fan control Air circulation
HEATER 🔥 Main heater control Temperature control
IR_HEATER 🌡️ Infrared heater control Advanced heating
LIGHTS 💡 Light control Ambient lighting
RESTART 🔄 Device restart System control
SAUNA 🧖 Sauna mode control Main functionality
STEAMER 💨 Steamer control Steam generation
TRACE_LOG 📝 Enable trace logging Debugging
UPDATE 🔄 Trigger update System updates
VAPORIZER 💧 Vaporizer control Humidity control
🔄 OtaState

OTA update execution states:
Value Description Status
IDLE 📋 No update in progress Ready
IN_PROGRESS ⚡ Update running Active
DONE ✅ Update completed Success
CANCELLED ❌ Update cancelled Failed
☁️ CloudLoggingState

Remote logging configuration states:
Value Description Usage
DISABLED 🚫 No remote logging Default
MANUAL 📝 Manual log collection On-demand
CONTINUOUS 📊 Continuous logging Real-time monitoring
🏢 OrganizationUpdate

Device organization membership changes:
Value Description Action
ADD ➕ Add device to organization Join
REMOVE ➖ Remove device from organization Leave
👁️ VisibleReason

Device access visibility levels:
Value Description Access Level
Organization 🏢 Organization member Org access
Contract 📋 Contract access Contract access
CanSee 👀 Direct visibility Direct access
Unknown ❓ Unknown reason Limited access
🌐 REST API

Note: All REST API endpoints require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the REST API base URL from the endpoints configuration: endpoints.RestApi.device.https
📋 GET /devices

    Retrieves a paginated list of devices owned by the authenticated user.

Query Parameters:
Parameter Type Required Description
maxResults number ⚪ Maximum number of results to return
nextToken string ⚪ Pagination token for continuing from a previous response

Success Response (200):

{
"devices": [
{
"deviceId": "DEVICE-ABC123-XYZ789",
"type": "sauna",
"attr": [
{ "key": "name", "value": "Main Sauna" },
{ "key": "location", "value": "Building A" }
],
"roles": ["owner"],
"via": "Organization"
}
],
"nextToken": "eyJwYWdlIjoiMiJ9"
}

Error Response:

{
"error": "string",
"message": "string"
}

Notes:

    Pagination: When nextToken is returned, pass it back to fetch the next page.
    Authorization is based on the caller's ID token and service authorization rules.

📤 POST /devices/command

    Sends a command to a device and waits for acknowledgement.

Request Body:
Parameter Type Required Description
deviceId string ✅ The device identifier (AWS IoT Thing Name)
cabin object ⚪ Cabin selector for the command
cabin.id string ⚪ Cabin identifier such as C1. Mutually exclusive with cabin.name
cabin.name string ⚪ Cabin display name as advertised by the device. Mutually exclusive with cabin.id
command object ✅ Command details
command.type enum ✅ One of: SAUNA, LIGHTS, FAN
command.state string|boolean|number ✅ Toggle value; accepts on/off, true/false, or 1/0

Success Response (200):

{
"handled": true
}

Error Response:

{
"error": "string",
"message": "string",
"handled": false,
"failureReason": "Device unavailable"
}

Notes:

    Persists the command, publishes it to the device, and waits for an acknowledgement.
    If the device doesn't respond in time, returns 504 Gateway Timeout with { handled: false, failureReason: "Device unavailable" }.
    If neither cabin.id nor cabin.name is provided, cabin.id defaults to C1.

📊 GET /devices/state

    Retrieves the current state of a device shadow (named shadow, default depends on device type).

Query Parameters:
Parameter Type Required Description
deviceId string ✅ Device identifier (AWS IoT Thing Name)
subId string ⚪ Cabin sub-shadow identifier (e.g., C1, classic). Mutually exclusive with cabinName
cabinName string ⚪ Friendly cabin name. Mutually exclusive with subId

Success Response (200):

{
"deviceId": "DEVICE-ABC123-XYZ789",
"shadowName": "C1",
"state": {
"temp": 78,
"targetHum": 38
},
"version": 123,
"timestamp": 1735689600000,
"metadata": {
"state": {}
},
"connectionState": {
"connected": true,
"updatedTimestamp": 1735689600000
}
}

Error Response:

{
"error": "string",
"message": "string"
}

Notes:

    Returns the selected named shadow state (not classic shadow, except for Sauna sensor). The state field contains reported data from the device.
    If neither subId nor cabinName is provided:
        For most devices (e.g., Fenix), subId defaults to C1
        For Sauna sensor devices, defaults to classic shadow

🌡️ PATCH /devices/target

    Updates the target temperature and/or humidity for a device cabin.

Request Body:
Parameter Type Required Description
deviceId string ✅ Device identifier (AWS IoT Thing Name)
temperature number ⚪ Target temperature to set
humidity number ⚪ Target humidity to set
cabin object ⚪ Cabin selector identifying the sub-shadow to update
cabin.id string ⚪ Cabin identifier such as C1. Mutually exclusive with cabin.name
cabin.name string ⚪ Cabin display name. Mutually exclusive with cabin.id

Success Response (200):

{
"deviceId": "DEVICE-ABC123-XYZ789",
"shadowName": "C1",
"updated": {
"temperature": 22,
"humidity": 50
}
}

Error Response:

{
"error": "string",
"message": "string"
}

Notes:

    Supply at least one of temperature or humidity; both can be provided to update together.
    If neither cabin.id nor cabin.name is provided, cabin.id defaults to C1.

👤 PATCH /devices/profile

    Updates the active profile for a device cabin.

Request Body:
Parameter Type Required Description
deviceId string ✅ Device identifier (AWS IoT Thing Name)
profile string ✅ Profile name or identifier as stored in the shadow
cabin object ⚪ Cabin selector identifying the sub-shadow to update
cabin.id string ⚪ Cabin identifier such as C1. Mutually exclusive with cabin.name
cabin.name string ⚪ Cabin display name. Mutually exclusive with cabin.id

Success Response (200):

{
"deviceId": "DEVICE-ABC123-XYZ789",
"shadowName": "C1",
"activeProfile": 2,
"profile": "eco"
}

Error Response:

{
"error": "string",
"message": "string"
}

Notes:

    If neither cabin.id nor cabin.name is provided, cabin.id defaults to C1.

💡 REST API Examples

Each example below shows the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.
🟨 Using JavaScript/fetch

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiBase = endpoints.RestApi.device.https;
const restApiGenerics = endpoints.RestApi.generics.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

async function call(method, path, body) {
const res = await fetch(`${restApiBase}${path}`, {
method,
headers: {
Authorization: `Bearer ${idToken}`,
"Content-Type": "application/json",
},
body: body === undefined ? undefined : JSON.stringify(body),
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
return res.json();
}

// List user's devices
const devices = await call("GET", `/devices?maxResults=50`);
console.log(devices);

// Send a device command
const commandResult = await call("POST", `/devices/command`, {
deviceId: "DEVICE-ABC123-XYZ789",
cabin: { id: "C1" },
command: { type: "SAUNA", state: "on" },
});
console.log(commandResult);

// Get device state (cabin shadow via subId)
const cabinStateById = await call(
"GET",
`/devices/state?deviceId=${encodeURIComponent("DEVICE-ABC123-XYZ789")}&subId=${encodeURIComponent("C1")}`
);
console.log(cabinStateById);

// Update device target values
const updatedTarget = await call("PATCH", `/devices/target`, {
deviceId: "DEVICE-ABC123-XYZ789",
cabin: { id: "C1" },
temperature: 22,
humidity: 50,
});
console.log(updatedTarget);

// Update active profile
const updatedProfile = await call("PATCH", `/devices/profile`, {
deviceId: "DEVICE-ABC123-XYZ789",
cabin: { id: "C1" },
profile: "eco",
});
console.log(updatedProfile);

🐍 Using Python/requests

import requests

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_base = endpoints["RestApi"]["device"]["https"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def call(method, path, body=None):
res = requests.request(
method,
f"{rest_api_base}{path}",
headers={"Authorization": f"Bearer {id_token}", "Content-Type": "application/json"},
json=body if body else None
)
if not res.ok:
raise Exception(f"{res.status_code} {res.text}")
return res.json()

# List user's devices

devices = call("GET", "/devices?maxResults=50")
print(devices)

# Send a device command

command_result = call("POST", "/devices/command", {
"deviceId": "DEVICE-ABC123-XYZ789",
"cabin": {"id": "C1"},
"command": {"type": "SAUNA", "state": "on"}
})
print(command_result)

# Get device state

cabin_state = call("GET", "/devices/state?deviceId=DEVICE-ABC123-XYZ789&subId=C1")
print(cabin_state)

# Update device target values

updated_target = call("PATCH", "/devices/target", {
"deviceId": "DEVICE-ABC123-XYZ789",
"cabin": {"id": "C1"},
"temperature": 22,
"humidity": 50
})
print(updated_target)

# Update active profile

updated_profile = call("PATCH", "/devices/profile", {
"deviceId": "DEVICE-ABC123-XYZ789",
"cabin": {"id": "C1"},
"profile": "eco"
})
print(updated_profile)

🔧 Using cURL

# Get endpoints and authenticate

ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_BASE=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.device.https')
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
 --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

# List user's devices

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     "$REST_API_BASE/devices?maxResults=50" | jq '.'

# Send a device command

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -X POST \
     --data '{"deviceId":"DEVICE-ABC123-XYZ789","cabin":{"id":"C1"},"command":{"type":"SAUNA","state":"on"}}' \
     "$REST_API_BASE/devices/command" | jq '.'

# Get device state

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     "$REST_API_BASE/devices/state?deviceId=DEVICE-ABC123-XYZ789&subId=C1" | jq '.'

# Update device target values

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -X PATCH \
     --data '{"deviceId":"DEVICE-ABC123-XYZ789","cabin":{"id":"C1"},"temperature":22,"humidity":50}' \
     "$REST_API_BASE/devices/target" | jq '.'

# Update active profile

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     -H "Content-Type: application/json" \
     -X PATCH \
     --data '{"deviceId":"DEVICE-ABC123-XYZ789","cabin":{"id":"C1"},"profile":"eco"}' \
     "$REST_API_BASE/devices/profile" | jq '.'

🔵 GraphQL

The Device Service provides GraphQL queries, mutations, and subscriptions for device management and control.

Note: All GraphQL requests require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the GraphQL endpoint from the endpoints configuration: endpoints.GraphQL.device.https
🔍 Queries
🔍 devicesGet

    Retrieves a specific device by ID.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device

Returns: Device - Device information with attributes and roles

Example:

query GetDevice {
devicesGet(deviceId: "DEVICE-ABC123-XYZ789") {
id
type
attr {
key
value
}
roles
via
}
}

🔍 devicesSearch

    Searches for devices using a query string.

Arguments:
Parameter Type Required Description
query String! ✅ Search query string
nextToken String ⚪ Pagination token
maxResults Int ⚪ Maximum results to return

Returns: Devices - List of matching devices with pagination

Example:

query SearchDevices {
devicesSearch(query: "type:sauna", maxResults: 50) {
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

📊 devicesStatesGet

    Gets the current state of a device shadow.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
shadowName String ⚪ Shadow name (default: device)

Returns: DeviceState - Device shadow state with desired/reported values

Example:

query GetDeviceState {
devicesStatesGet(deviceId: "DEVICE-ABC123-XYZ789") {
deviceId
shadowName
desired
reported
timestamp
version
connectionState {
connected
updatedTimestamp
}
}
}

🏷️ devicesTagsList

    Lists all tags for a device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device

Returns: [String!]! - Array of tag strings

Example:

query GetDeviceTags {
devicesTagsList(deviceId: "DEVICE-ABC123-XYZ789")
}

🔐 devicesTokenExists

    Checks if a device token exists in secrets manager.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device

Returns: Boolean - True if token exists

Example:

query CheckDeviceToken {
devicesTokenExists(deviceId: "DEVICE-ABC123-XYZ789")
}

🔒 devicesEncrypt

    Encrypts a message for a specific device.

Arguments:
Parameter Type Required Description
deviceId ID ⚪ The ID of the device
certificateArn String ⚪ Certificate ARN for encryption
message String! ✅ Message to encrypt

Returns: String - Encrypted message

Example:

query EncryptMessage {
devicesEncrypt(
deviceId: "DEVICE-ABC123-XYZ789"
message: "Hello, device!"
)
}

🏢 organizationsDevicesList

    Lists all devices in an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
nextToken String ⚪ Pagination token
maxResults Int ⚪ Maximum results to return
recursive Boolean ⚪ Include sub-organizations

Returns: Devices - List of organization devices with pagination

Example:

query ListOrgDevices {
organizationsDevicesList(
organizationId: "ORG-PROD-001"
maxResults: 50
) {
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

📋 organizationsContractsDevicesList

    Lists devices accessible through contracts.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization

Returns: Devices - List of contract-accessible devices

Example:

query ListContractDevices {
organizationsContractsDevicesList(organizationId: "ORG-PROD-001") {
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

👤 usersDevicesList

    Lists devices owned by the calling user.

Arguments:
Parameter Type Required Description
nextToken String ⚪ Pagination token

Returns: Devices - List of user's devices with pagination

Example:

query ListMyDevices {
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

🔧 operatorsDevicesList

    Lists devices with direct contract access.

Arguments:
Parameter Type Required Description
nextToken String ⚪ Pagination token

Returns: Devices - List of operator-accessible devices

Example:

query ListOperatorDevices {
operatorsDevicesList {
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

📱 devicesMetadataGet

    Gets device metadata including owner and roles.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device

Returns: DeviceMetadata - Device metadata with owner and contact info

Example:

query GetDeviceMetadata {
devicesMetadataGet(deviceId: "DEVICE-ABC123-XYZ789") {
deviceId
owner
roles
contactName
phoneCountryCode
phoneNumber
}
}

🔄 otaUpdatesList

    Lists available OTA updates.

Arguments:
Parameter Type Required Description
nextToken String ⚪ Pagination token
deviceType String ⚪ Filter by device type
hwVersion String ⚪ Filter by hardware version

Returns: OtaUpdates - List of available OTA updates

Example:

query ListOtaUpdates {
otaUpdatesList(deviceType: "sauna") {
otaUpdates {
otaId
firmwareVersion
size
description
enabled
deviceType
hwVersion
}
nextToken
}
}

📊 otaUpdatesStatesList

    Lists OTA update states for devices.

Arguments:
Parameter Type Required Description
onlyActive Boolean ⚪ Show only active updates
nextToken String ⚪ Pagination token

Returns: OtaUpdateStates - List of OTA update states

Example:

query ListOtaUpdateStates {
otaUpdatesStatesList(onlyActive: true) {
otaUpdateStates {
deviceId
updateState
progressPercent
timestamp
}
nextToken
}
}

🏢 devicesFleetStatusGet

    Gets fleet status for an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization

Returns: DeviceFleetStatus - Fleet status with device counts

Example:

query GetFleetStatus {
devicesFleetStatusGet(organizationId: "ORG-PROD-001") {
fleetStatus {
key
value
}
}
}

📦 otaUpdatesBatchList

    Lists OTA update batch executions for an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
nextToken String ⚪ Pagination token

Returns: OtaUpdateBatchExecutions - List of batch executions with pagination

Example:

query ListOtaBatches {
otaUpdatesBatchList(organizationId: "ORG-PROD-001") {
otaBatchExecutions {
id
startDate
currentCount
maxCount
executionStatus
idle
updating
done
failed
}
nextToken
}
}

✏️ Mutations
📤 devicesCommandsSend

    Sends a command to a device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
command Command! ✅ The command to send
subId String ⚪ Subsystem ID
params AWSJSON ⚪ Command parameters

Returns: CommandResponse - Command execution result

Example:

mutation SendCommand {
devicesCommandsSend(
deviceId: "DEVICE-ABC123-XYZ789"
command: { type: SAUNA }
params: "{\"temperature\": 80}"
) {
response
failureReason
}
}

🗑️ devicesDelete

    Deletes a device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device

Returns: String - Deletion confirmation

Example:

mutation DeleteDevice {
devicesDelete(deviceId: "DEVICE-ABC123-XYZ789")
}

📊 devicesStatesUpdate

    Updates device shadow state.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
state AWSJSON! ✅ New state data
shadowName String ⚪ Shadow name (default: device)
clientToken String ⚪ Client token for idempotency

Returns: AWSJSON - Updated state

Example:

mutation UpdateDeviceState {
devicesStatesUpdate(
deviceId: "DEVICE-ABC123-XYZ789"
state: "{\"desired\": {\"temp\": 80}}"
shadowName: "C1"
)
}

✏️ devicesUpdate

    Updates device attributes.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
attributes [AttributeInput!]! ✅ Attributes to update

Returns: Device - Updated device

Example:

mutation UpdateDevice {
devicesUpdate(
deviceId: "DEVICE-ABC123-XYZ789"
attributes: [
{ key: "name", value: "Main Sauna" }
{ key: "location", value: "Building A" }
]
) {
id
type
attr {
key
value
}
}
}

🏷️ devicesTagsUpdate

    Updates device tags.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
tags [String!]! ✅ New tags list

Returns: [String!]! - Updated tags

Example:

mutation UpdateDeviceTags {
devicesTagsUpdate(
deviceId: "DEVICE-ABC123-XYZ789"
tags: ["production", "sauna", "building-a"]
)
}

🔄 devicesOtaUpdatesStart

    Starts OTA update for a device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
otaId ID! ✅ The OTA update ID

Returns: Boolean - Success status

Example:

mutation StartOtaUpdate {
devicesOtaUpdatesStart(
deviceId: "DEVICE-ABC123-XYZ789"
otaId: "ota-456"
)
}

❌ devicesOtaUpdatesCancel

    Cancels OTA update for a device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device

Returns: Boolean - Success status

Example:

mutation CancelOtaUpdate {
devicesOtaUpdatesCancel(deviceId: "DEVICE-ABC123-XYZ789")
}

🏢 organizationsDevicesMove

    Moves a device between organizations.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
organizationId ID ⚪ Target organization ID
subId String ⚪ Subsystem ID

Returns: Device - Updated device (null if unmanaged)

Example:

mutation MoveDevice {
organizationsDevicesMove(
deviceId: "DEVICE-ABC123-XYZ789"
organizationId: "ORG-NEW-001"
) {
id
type
attr {
key
value
}
}
}

📝 devicesRemoteLoggingSet

    Sets remote logging state for a device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
cloudLogging CloudLoggingState! ✅ Logging state

Returns: Boolean - Success status

Example:

mutation SetRemoteLogging {
devicesRemoteLoggingSet(
deviceId: "DEVICE-ABC123-XYZ789"
cloudLogging: CONTINUOUS
)
}

🔐 devicesTokenSet

    Saves device token to secrets manager.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
token String! ✅ Device token
mac String ⚪ Device MAC address

Returns: Boolean - Success status

Example:

mutation SetDeviceToken {
devicesTokenSet(
deviceId: "DEVICE-ABC123-XYZ789"
token: "device-token-string"
mac: "AA:BB:CC:DD:EE:FF"
)
}

🔗 devicesPair

    Pairs a device with Home2Net cloud.

Arguments:
Parameter Type Required Description
mac String! ✅ Device MAC address

Returns: String - Pairing result

Example:

mutation PairDevice {
devicesPair(mac: "AA:BB:CC:DD:EE:FF")
}

🚀 otaUpdatesBatchStart

    Starts OTA update batch for devices in an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
query String! ✅ Search query for target devices
otaId ID! ✅ The OTA update ID
maxCount Int! ✅ Maximum number of devices to update
dailyMaxCount Int ⚪ Daily maximum update count

Returns: ID - Batch execution ID

Example:

mutation StartOtaBatch {
otaUpdatesBatchStart(
organizationId: "ORG-PROD-001"
query: "type:sauna"
otaId: "ota-456"
maxCount: 100
dailyMaxCount: 10
)
}

⏹️ otaUpdatesBatchStop

    Stops OTA update batch execution.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
id ID! ✅ Batch execution ID

Returns: Boolean - Success status

Example:

mutation StopOtaBatch {
otaUpdatesBatchStop(
organizationId: "ORG-PROD-001"
id: "batch-execution-123"
)
}

🏢 organizationsOtaUpdatesStart

    Starts OTA updates for all devices in an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
otaId ID! ✅ The OTA update ID

Returns: Boolean - Success status

Example:

mutation StartOrgOtaUpdates {
organizationsOtaUpdatesStart(
organizationId: "ORG-PROD-001"
otaId: "ota-456"
)
}

❌ organizationsOtaUpdatesCancel

    Cancels OTA updates for all devices in an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization

Returns: Boolean - Success status

Example:

mutation CancelOrgOtaUpdates {
organizationsOtaUpdatesCancel(organizationId: "ORG-PROD-001")
}

📋 organizationsContractsAddDevice

    Creates a new contract for a device between organizations.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
deviceSerialNumber String! ✅ Device serial number
userEmail String! ✅ User email for the contract

Returns: DeviceContractResult - Contract creation result

Example:

mutation CreateDeviceContract {
organizationsContractsAddDevice(
organizationId: "ORG-PROD-001"
deviceSerialNumber: "SN123456789"
userEmail: "user@example.com"
) {
contractId
contractName
deviceId
}
}

📍 devicesLocationStore

    Stores device GPS coordinates and location information as device attributes.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
latitude Float! ✅ GPS latitude
longitude Float! ✅ GPS longitude
accuracy Float! ✅ Location accuracy in meters

Returns: Boolean - Success status

Example:

mutation StoreDeviceLocation {
devicesLocationStore(
deviceId: "DEVICE-ABC123-XYZ789"
latitude: 60.1699
longitude: 24.9384
accuracy: 10.5
)
}

💻 HTTP Request Examples

The following examples show how to make GraphQL queries and mutations using HTTP. Each example includes the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.
🟨 Using JavaScript/fetch

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.device.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Example query
const query = `  query GetDevice {
    devicesGet(deviceId: "DEVICE-ABC123-XYZ789") {
      id
      type
      attr {
        key
        value
      }
      roles
      via
    }
  }`;

const graphqlResponse = await fetch(graphqlEndpoint, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${idToken}`
},
body: JSON.stringify({ query })
});

const data = await graphqlResponse.json();
console.log(data);

🐍 Using Python/requests

import requests

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["device"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

# Example query

query = """
query GetDevice {
devicesGet(deviceId: "DEVICE-ABC123-XYZ789") {
id
type
attr {
key
value
}
roles
via
}
}
"""

response = requests.post(
graphql_endpoint,
headers={
'Content-Type': 'application/json',
'Authorization': f"Bearer {id_token}"
},
json={'query': query}
)

data = response.json()
print(data)

🔧 Using cURL

# Get endpoints and authenticate

ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')
GRAPHQL=$(echo "$ENDPOINTS" | jq -r '.endpoints.GraphQL.device.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
 --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

QUERY='{"query":"query GetDevice {\\n devicesGet(deviceId: \"DEVICE-ABC123-XYZ789\") {\\n id\\n type\\n attr {\\n key\\n value\\n }\\n roles\\n via\\n }\\n}"}'

curl -sS -H "Content-Type: application/json" \
 -H "Authorization: Bearer $ID_TOKEN" \
  -X POST "$GRAPHQL" \
 --data "$QUERY" | jq '.'

📡 Subscriptions

    ⚠️ Important: Subscriptions are more complex than queries/mutations as they require WebSocket connections.

🔧 Setup Requirements

JavaScript/Node.js:

npm install aws-appsync aws-appsync-auth-link graphql graphql-tag

Note: aws-appsync requires graphql version 14.x or 15.0.0–15.3.0 (not 16+). If you encounter compatibility issues, install with: npm install aws-appsync aws-appsync-auth-link graphql@14 graphql-tag

Python:

pip install requests websocket-client

Note: Use the Cognito IdToken obtained via the REST API (see API Overview). Get endpoints from the Endpoints API; the client URL comes from endpoints.GraphQL.device.https. The receiver must be the JWT claim cognito:username from your IdToken.
📊 devicesStatesUpdateFeed

    Real-time feed of device state updates.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: DeviceStateUpdateNotice - Real-time device state updates

Example:

subscription DeviceStateUpdates {
devicesStatesUpdateFeed(receiver: "user-abc-123-def-456") {
receiver
item {
deviceId
desired
reported
timestamp
connectionState {
connected
updatedTimestamp
}
}
}
}

🔄 otaUpdatesStatesUpdateFeed

    Real-time feed of OTA update state changes.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: OtaUpdateStateNotice - Real-time OTA update notifications

Example:

subscription OtaUpdateStates {
otaUpdatesStatesUpdateFeed(receiver: "user-abc-123-def-456") {
receiver
item {
deviceId
updateState
progressPercent
timestamp
}
}
}

🏢 devicesOrganizationsUpdateFeed

    Real-time feed of device organization changes.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: DeviceOrganizationUpdateNotice - Real-time organization updates

Example:

subscription DeviceOrganizationUpdates {
devicesOrganizationsUpdateFeed(receiver: "user-abc-123-def-456") {
receiver
deviceId
organizationId
updateType
timestamp
}
}

✏️ devicesAttributesUpdateFeed

    Real-time feed of device attribute changes.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: DeviceAttributesUpdateNotice - Real-time attribute updates

Example:

subscription DeviceAttributesUpdates {
devicesAttributesUpdateFeed(receiver: "user-abc-123-def-456") {
receiver
deviceId
attributes {
key
value
}
timestamp
}
}

📦 otaUpdatesBatchFeed

    Real-time feed of OTA batch update notifications.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: OtaUpdatesBatchNotice - Real-time batch update notifications

Example:

subscription OtaBatchUpdates {
otaUpdatesBatchFeed(receiver: "user-abc-123-def-456") {
item {
organizationId
id
currentCount
executionStatus
idle
updating
done
failed
}
}
}

📊 Subscription Examples

The following examples show complete subscription setup including authentication. For detailed authentication setup and token management, see the API Overview section.
🟨 Using JavaScript/Node.js

import { AWSAppSyncClient } from "aws-appsync";
import { AUTH_TYPE } from "aws-appsync-auth-link";
import gql from "graphql-tag";

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.device.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Extract user ID from JWT token (required for receiver argument)
const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8'));
const userId = tokenPayload['cognito:username'];

// Create AppSync client
const client = new AWSAppSyncClient({
url: graphqlEndpoint,
region: "eu-central-1",
auth: {
type: AUTH_TYPE.AWS_LAMBDA,
token: async () => `Bearer ${idToken}`,
},
disableOffline: true,
});

// Subscribe to device state updates
const subscription = client.subscribe({
query: gql`  subscription DeviceStateUpdates {
      devicesStatesUpdateFeed(receiver: "${userId}") {
        receiver
        item {
          deviceId
          desired
          reported
          timestamp
          connectionState {
            connected
            updatedTimestamp
          }
        }
      }
    }`
});

subscription.subscribe({
next: (data) => console.log("Received:", data),
error: (error) => console.error("Error:", error)
});

🐍 Using Python/requests

import json
import base64
import websocket
import requests
from uuid import uuid4

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["device"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def header_encode(header_obj):
"""Encode header using Base 64"""
return base64.b64encode(json.dumps(header_obj).encode('utf-8')).decode('utf-8')

# Extract user ID from JWT token

token_payload = json.loads(base64.b64decode(id_token.split('.')[1] + '==').decode('utf-8'))
user_id = token_payload['cognito:username']

# Build WebSocket URL and host

wss_url = graphql_endpoint.replace('https', 'wss').replace('appsync-api', 'appsync-realtime-api')
host = graphql_endpoint.replace('https://', '').replace('/graphql', '')

# Generate subscription ID

sub_id = str(uuid4())

# Create JWT authentication header

auth_header = {
'host': host,
'Authorization': f"Bearer {id_token}"
}

# GraphQL subscription

gql_subscription = json.dumps({
'query': f'subscription DeviceStateUpdates {{ devicesStatesUpdateFeed(receiver: "{user_id}") {{ receiver item {{ deviceId desired reported timestamp connectionState {{ connected updatedTimestamp }} }} }} }}',
'variables': {}
})

# WebSocket event callbacks

def on_message(ws, message):
message_object = json.loads(message)
message_type = message_object['type']

    if message_type == 'connection_ack':
        # Register subscription
        register = {
            'id': sub_id,
            'payload': {
                'data': gql_subscription,
                'extensions': {'authorization': auth_header}
            },
            'type': 'start'
        }
        ws.send(json.dumps(register))

    elif message_type == 'start_ack':
        print("✅ Subscription registered successfully")

    elif message_type == 'data':
        print("✅ Received subscription data:", message_object['payload'])
        # Stop subscription
        ws.send(json.dumps({'type': 'stop', 'id': sub_id}))

def on_open(ws):
ws.send(json.dumps({'type': 'connection_init'}))

# Create WebSocket connection

connection_url = wss_url + '?header=' + header_encode(auth_header) + '&payload=e30='
ws = websocket.WebSocketApp(
connection_url,
subprotocols=['graphql-ws'],
on_open=on_open,
on_message=on_message
)

# Run WebSocket (use proper threading/timeout handling)

ws.run_forever()

📋 Types
🔧 Device

    Device representation

Field Type Required Description
id String! ✅ Device identifier
type String! ✅ Device type
attr [Attribute!]! ✅ Device attributes
roles [String!]! ✅ User roles for the device
via VisibleReason! ✅ Visibility reason
📋 Devices

    Paginated device list

Field Type Required Description
devices [Device!]! ✅ List of devices
nextToken String ⚪ Pagination token
📊 DeviceState

    Device shadow state

Field Type Required Description
deviceId ID! ✅ Device identifier
shadowName String ⚪ Shadow name
desired AWSJSON ⚪ Desired state
reported AWSJSON ⚪ Reported state
timestamp Float ⚪ State timestamp
version Int ⚪ Shadow version
clientToken String ⚪ Client token for idempotency
connectionState DeviceConnectionState ⚪ Connection status
metadata AWSJSON ⚪ State metadata
📱 DeviceMetadata

    Device metadata

Field Type Required Description
deviceId ID! ✅ Device identifier
owner String ⚪ Device owner
roles [String] ⚪ User roles
contactName String ⚪ Contact name
phoneCountryCode String ⚪ Phone country code
phoneNumber String ⚪ Phone number
📤 CommandResponse

    Command execution result

Field Type Required Description
response Boolean! ✅ Command handled status
failureReason String ⚪ Failure reason if not handled
🔄 OtaUpdate

    OTA update information

Field Type Required Description
otaId String! ✅ OTA update ID
firmwareVersion String! ✅ Firmware version
size Int ⚪ Update size
description String ⚪ Update description
filename String ⚪ Update filename
enabled Boolean ⚪ Update enabled status
urlExpirationSeconds Int ⚪ URL expiration time in seconds
deviceType String ⚪ Target device type
hwVersion String ⚪ Hardware version
betaTesting Boolean ⚪ Beta testing flag
📦 OtaUpdates

    Paginated OTA updates list

Field Type Required Description
otaUpdates [OtaUpdate!]! ✅ List of OTA updates
nextToken String ⚪ Pagination token
📊 OtaUpdateState

    OTA update state

Field Type Required Description
batchKey String ⚪ Batch update key
deviceId ID! ✅ Device identifier
updateFirmwareVersion String ⚪ Firmware version being updated
updateState OtaState ⚪ Update state
resultCode Int ⚪ Result code
progressPercent Int ⚪ Progress percentage
timestamp String ⚪ State timestamp
🏢 DeviceFleetStatus

    Fleet status

Field Type Required Description
fleetStatus [DeviceFleetStatusAttribute!]! ✅ Fleet status attributes
🔗 Attribute

    Device attribute

Field Type Required Description
key String! ✅ Attribute key
value String ⚪ Attribute value
🔌 DeviceConnectionState

    Device connection state

Field Type Required Description
connected Boolean! ✅ Connection status
updatedTimestamp String! ✅ Last update timestamp
📦 OtaUpdateStates

    Paginated OTA update states list

Field Type Required Description
otaUpdateStates [OtaUpdateState!]! ✅ List of OTA update states
nextToken String ⚪ Pagination token
🚀 OtaBatchExecution

    OTA batch execution

Field Type Required Description
organizationId ID! ✅ Organization identifier
id ID! ✅ Batch execution ID
startDate String ⚪ Start date
stopDate String ⚪ Stop date
currentCount Int ⚪ Current update count
maxCount Int ⚪ Maximum update count
dailyMaxCount Int ⚪ Daily maximum count
executionStatus String ⚪ Execution status
searchQuery String ⚪ Device search query
userId String ⚪ User identifier
idle Int ⚪ Idle device count
updating Int ⚪ Updating device count
done Int ⚪ Completed device count
failed Int ⚪ Failed device count
📋 OtaUpdateBatchExecutions

    Paginated OTA batch executions list

Field Type Required Description
otaBatchExecutions [OtaBatchExecution!]! ✅ List of batch executions
nextToken String ⚪ Pagination token
🔑 DeviceFleetStatusAttribute

    Fleet status attribute

Field Type Required Description
key String! ✅ Attribute key
value Int! ✅ Attribute value
📄 DeviceContractResult

    Device contract creation result

Field Type Required Description
contractId ID! ✅ Contract identifier
contractName String! ✅ Contract name
deviceId ID! ✅ Device identifier
📋 Sample Responses
✅ Successful Query Response

{
"data": {
"devicesGet": {
"id": "DEVICE-ABC123-XYZ789",
"type": "sauna",
"attr": [
{ "key": "name", "value": "Main Sauna" },
{ "key": "location", "value": "Building A" }
],
"roles": ["owner"],
"via": "Organization"
}
}
}

❌ Error Response

{
"errors": [
{
"message": "Device not found",
"locations": [{"line": 3, "column": 5}],
"path": ["devicesGet"],
"extensions": {
"code": "DEVICE_NOT_FOUND",
"exception": {
"stacktrace": ["Error: Device not found", " at ..."]
}
}
}
],
"data": null
}

📄 Pagination

For paginated results, use the nextToken from the response in subsequent requests:

query GetMoreDevices {
devicesSearch(
query: "type:sauna"
maxResults: 50
nextToken: "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7InBhcnRpdGlvbl9rZXkiOnsic..."
) {
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

📡 Events Service

    🚀 Built for: Real-time event monitoring, user notifications, and alert workflows
    🔧 Tech Stack: GraphQL, AWS Lambda, AWS IAM, Amazon Cognito
    📊 Data Sources: Amazon Pinpoint, Amazon Kinesis Firehose, Amazon S3

🏷️ Enums
📊 EventType

Event classification types:
Value Description Category
SENSOR 📡 Sensor-based events Hardware
GENERIC 🔧 Generic system events System
🔄 EventState

Event state management:
Value Description Status
ACTIVE ✅ Event is active and requires attention Active
INACTIVE ❌ Event has been resolved or deactivated Resolved
⚠️ EventSeverity

Event severity levels:
Value Description Priority
LOW 🟢 Low priority event Low
MEDIUM 🟡 Medium priority event Medium
HIGH 🔴 High priority event High
📱 NotificationType

Notification delivery methods:
Value Description Channel
SMS 📱 SMS text message Mobile
EMAIL 📧 Email notification Email
PUSH 🔔 Push notification Mobile App
📊 NotificationState

Notification delivery status:
Value Description Status
OK ✅ Notification delivered successfully Success
MISSING_ENDPOINT ❌ Delivery endpoint not configured Failed
🔵 GraphQL

The Events Service provides GraphQL queries, mutations, and subscriptions for event monitoring and notifications.

Note: All GraphQL requests require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the GraphQL endpoint from the endpoints configuration: endpoints.GraphQL.events.https
🔍 Queries
📡 devicesEventsList

    Lists events for a specific device.

Arguments:
Parameter Type Required Description
deviceId ID! ✅ The ID of the device
period TimePeriod ⚪ Time range filter
nextToken String ⚪ Pagination token

Returns: Events - List of device events with pagination

Example:

query GetDeviceEvents {
devicesEventsList(
deviceId: "DEVICE-ABC123-XYZ789"
period: {
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
}
) {
events {
deviceId
timestamp
eventId
type
eventState
severity
sensorName
sensorValue
displayName
}
nextToken
}
}

🏢 organizationsEventsList

    Lists events for all devices in an organization.

Arguments:
Parameter Type Required Description
organizationId ID! ✅ The ID of the organization
period TimePeriod ⚪ Time range filter
nextToken String ⚪ Pagination token

Returns: Events - List of organization events with pagination

Example:

query GetOrganizationEvents {
organizationsEventsList(
organizationId: "ORG-PROD-001"
period: {
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
}
) {
events {
deviceId
timestamp
eventId
type
severity
displayName
}
nextToken
}
}

📋 eventsMetadataList

    Lists available event metadata definitions.

Arguments:
Parameter Type Required Description
nextToken String ⚪ Pagination token

Returns: EventMetadataList - List of event metadata with pagination

Example:

query GetEventMetadata {
eventsMetadataList {
eventMetadataItems {
eventId
name
description
}
nextToken
}
}

🔔 notificationsSubscriptionsList

    Lists notification subscriptions for a user.

Arguments:
Parameter Type Required Description
userId ID! ✅ The ID of the user
organizationId ID! ✅ The ID of the organization

Returns: NotificationSubscriptions - List of notification subscriptions

Example:

query GetNotificationSubscriptions {
notificationsSubscriptionsList(
userId: "user-abc-123-def-456"
organizationId: "ORG-PROD-001"
) {
subscriptions {
id
userId
organizationId
eventIds
type
state
}
}
}

✏️ Mutations
❌ eventsDeactivate

    Deactivates an event (marks as resolved).

Arguments:
Parameter Type Required Description
payload EventPayload! ✅ Event deactivation data

Returns: Event - Deactivated event

Example:

mutation DeactivateEvent {
eventsDeactivate(payload: {
deviceId: "DEVICE-ABC123-XYZ789"
timestamp: "1735689600000"
eventId: "event-cloud-connected"
eventState: INACTIVE
organizationId: "ORG-PROD-001"
type: GENERIC
severity: MEDIUM
displayName: "Device Connected"
}) {
deviceId
eventId
eventState
updatedTimestamp
organizationId
}
}

➕ notificationsSubscriptionsCreate

    Creates a new notification subscription.

Arguments:
Parameter Type Required Description
subscriptionDetails SubscriptionDetails! ✅ Subscription configuration

Returns: NotificationSubscription - Created subscription

Example:

mutation CreateNotificationSubscription {
notificationsSubscriptionsCreate(subscriptionDetails: {
type: EMAIL
userId: "user-abc-123-def-456"
owningOrganization: "ORG-PROD-001"
organizationId: "ORG-PROD-001"
eventId: "event-cloud-connected"
}) {
id
userId
organizationId
eventIds
type
state
}
}

    Note: Subscriptions are managed per user and organization. Creating duplicate subscriptions for the same event may return service errors indicating existing coverage.

🗑️ notificationsSubscriptionsRemove

    Removes a notification subscription.

Arguments:
Parameter Type Required Description
userId ID! ✅ The ID of the user
subscriptionId ID! ✅ The ID of the subscription

Returns: UnsubscribeInfo - Unsubscription details

Example:

mutation RemoveNotificationSubscription {
notificationsSubscriptionsRemove(
userId: "user-abc-123-def-456"
subscriptionId: "sub-abc-123-def-456"
) {
subscription {
id
userId
organizationId
eventIds
type
state
}
}
}

💻 HTTP Request Examples

The following examples show how to make GraphQL queries and mutations using HTTP. Each example includes the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.
🟨 Using JavaScript/fetch

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.events.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Example query
const query = `  query GetEvents {
    devicesEventsList(
      deviceId: "DEVICE-ABC123-XYZ789"
      period: {
        startTimestamp: "1735689600000"
        endTimestamp: "1735776000000"
      }
    ) {
      events {
        deviceId
        timestamp
        eventId
        type
        eventState
        severity
      }
      nextToken
    }
  }`;

const graphqlResponse = await fetch(graphqlEndpoint, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${idToken}`
},
body: JSON.stringify({ query })
});

const data = await graphqlResponse.json();
console.log(data);

🐍 Using Python/requests

import requests

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["events"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

# Example query

query = """
query GetEvents {
devicesEventsList(
deviceId: "DEVICE-ABC123-XYZ789"
period: {
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
}
) {
events {
deviceId
timestamp
eventId
type
eventState
severity
}
nextToken
}
}
"""

response = requests.post(
graphql_endpoint,
headers={
'Content-Type': 'application/json',
'Authorization': f"Bearer {id_token}"
},
json={'query': query}
)

data = response.json()
print(data)

🔧 Using cURL

# Get endpoints and authenticate

ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')
GRAPHQL=$(echo "$ENDPOINTS" | jq -r '.endpoints.GraphQL.events.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
 --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

QUERY='{"query":"query GetEvents {\\n devicesEventsList(\\n deviceId: \\"DEVICE-ABC123-XYZ789\\"\\n period: {\\n startTimestamp: \\"1735689600000\\"\\n endTimestamp: \\"1735776000000\\"\\n }\\n ) {\\n events {\\n deviceId\\n timestamp\\n eventId\\n type\\n eventState\\n severity\\n }\\n nextToken\\n }\\n}"}'

curl -sS -H "Content-Type: application/json" \
 -H "Authorization: Bearer $ID_TOKEN" \
  -X POST "$GRAPHQL" \
 --data "$QUERY" | jq '.'

📡 Subscriptions

    ⚠️ Important: Subscriptions are more complex than queries/mutations as they require WebSocket connections.

🔧 Setup Requirements

JavaScript/Node.js:

npm install aws-appsync aws-appsync-auth-link graphql graphql-tag

Note: aws-appsync requires graphql version 14.x or 15.0.0–15.3.0 (not 16+). If you encounter compatibility issues, install with: npm install aws-appsync aws-appsync-auth-link graphql@14 graphql-tag

Python:

pip install requests websocket-client

Note: Use the Cognito IdToken obtained via the REST API (see API Overview). Get endpoints from the Endpoints API; the client URL comes from endpoints.GraphQL.events.https. The receiver must be the JWT claim cognito:username from your IdToken.
🔔 eventsFeed

    Real-time feed of event notifications.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: EventNotice - Real-time event notifications

Example:

subscription EventUpdates {
eventsFeed(receiver: "user-abc-123-def-456") {
receiver
item {
deviceId
timestamp
eventId
type
eventState
severity
sensorName
sensorValue
displayName
}
}
}

📊 Subscription Examples

The following examples show complete subscription setup including authentication. For detailed authentication setup and token management, see the API Overview section.
🟨 Using JavaScript/Node.js

import { AWSAppSyncClient } from "aws-appsync";
import { AUTH_TYPE } from "aws-appsync-auth-link";
import gql from "graphql-tag";

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.events.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Extract user ID from JWT token (required for receiver argument)
const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8'));
const userId = tokenPayload['cognito:username'];

// Create AppSync client
const client = new AWSAppSyncClient({
url: graphqlEndpoint,
region: "eu-central-1",
auth: {
type: AUTH_TYPE.AWS_LAMBDA,
token: async () => `Bearer ${idToken}`,
},
disableOffline: true,
});

// Subscribe to events feed
const subscription = client.subscribe({
query: gql`   subscription EventsFeed {
      eventsFeed(receiver: "${userId}") {
        receiver
        item {
          deviceId
          timestamp
          eventId
          type
          eventState
          severity
          sensorName
          sensorValue
          displayName
        }
      }
    }
`
});

subscription.subscribe({
next: (data) => console.log("Received event:", data),
error: (error) => console.error("Error:", error)
});

🐍 Using Python/requests

import json
import base64
import websocket
import requests
from uuid import uuid4

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["events"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def header_encode(header_obj):
"""Encode header using Base 64"""
return base64.b64encode(json.dumps(header_obj).encode('utf-8')).decode('utf-8')

# Extract user ID from JWT token

token_payload = json.loads(base64.b64decode(id_token.split('.')[1] + '==').decode('utf-8'))
user_id = token_payload['cognito:username']

# Build WebSocket URL and host

wss_url = graphql_endpoint.replace('https', 'wss').replace('appsync-api', 'appsync-realtime-api')
host = graphql_endpoint.replace('https://', '').replace('/graphql', '')

# Generate subscription ID

sub_id = str(uuid4())

# Create JWT authentication header

auth_header = {
'host': host,
'Authorization': f"Bearer {id_token}"
}

# GraphQL subscription

gql_subscription = json.dumps({
'query': f'subscription EventsFeed {{ eventsFeed(receiver: "{user_id}") {{ receiver item {{ deviceId timestamp eventId type eventState severity sensorName sensorValue displayName }} }} }}',
'variables': {}
})

# WebSocket event callbacks

def on_message(ws, message):
message_object = json.loads(message)
message_type = message_object['type']

    if message_type == 'connection_ack':
        # Register subscription
        register = {
            'id': sub_id,
            'payload': {
                'data': gql_subscription,
                'extensions': {'authorization': auth_header}
            },
            'type': 'start'
        }
        ws.send(json.dumps(register))

    elif message_type == 'start_ack':
        print("✅ Subscription registered successfully")

    elif message_type == 'data':
        print("✅ Received subscription data:", message_object['payload'])
        # Stop subscription
        ws.send(json.dumps({'type': 'stop', 'id': sub_id}))

def on_open(ws):
ws.send(json.dumps({'type': 'connection_init'}))

# Create WebSocket connection

connection_url = wss_url + '?header=' + header_encode(auth_header) + '&payload=e30='
ws = websocket.WebSocketApp(
connection_url,
subprotocols=['graphql-ws'],
on_open=on_open,
on_message=on_message
)

# Run WebSocket (use proper threading/timeout handling)

ws.run_forever()

📋 Types
📊 Event

    Event representation

Field Type Required Description
deviceId ID! ✅ Device ID
timestamp String! ✅ Event timestamp
eventId ID ⚪ Event ID
organizationId ID ⚪ Organization ID
updatedTimestamp String ⚪ Last update timestamp
type EventType ⚪ Event type
eventState EventState ⚪ Event state
severity EventSeverity ⚪ Event severity
sensorName String ⚪ Sensor name
sensorValue Float ⚪ Sensor value
metadata String ⚪ Additional metadata
displayName String ⚪ Display name
📋 EventMetadata

    Event metadata definition

Field Type Required Description
eventId ID! ✅ Event ID
name String ⚪ Event name
description String ⚪ Event description
🔔 NotificationSubscription

    Notification subscription

Field Type Required Description
id ID! ✅ Subscription ID
userId ID! ✅ User ID
organizationId ID! ✅ Organization ID
eventIds [ID!]! ✅ Subscribed event IDs
type NotificationType! ✅ Notification type
state [NotificationState!]! ✅ Subscription states
📊 TimePeriod

    Time range filter

Field Type Required Description
startTimestamp String! ✅ Start timestamp
endTimestamp String! ✅ End timestamp
📋 SubscriptionDetails

    Subscription creation details

Field Type Required Description
type NotificationType! ✅ Notification type
userId ID! ✅ User ID
owningOrganization ID ⚪ Owning organization
organizationId ID ⚪ Organization ID
eventId ID ⚪ Event ID
deviceId ID ⚪ Device ID
📊 Events

    Paginated events list

Field Type Required Description
events [Event!]! ✅ List of events
nextToken String ⚪ Pagination token
📋 EventMetadataList

    Paginated event metadata list

Field Type Required Description
eventMetadataItems [EventMetadata!]! ✅ List of event metadata
nextToken String ⚪ Pagination token
📦 NotificationSubscriptions

    Notification subscriptions list

Field Type Required Description
subscriptions [NotificationSubscription!]! ✅ List of notification subscriptions
nextToken ID ⚪ Pagination token
📢 EventNotice

    Event notification

Field Type Required Description
receiver ID! ✅ Receiver identifier
item Event! ✅ Event data
🗑️ UnsubscribeInfo

    Unsubscribe information

Field Type Required Description
subscription NotificationSubscription ⚪ Removed subscription details
📋 Sample Responses
✅ Successful Query Response

{
"data": {
"devicesEventsList": {
"events": [
{
"deviceId": "DEVICE-ABC123-XYZ789",
"timestamp": "1735689600000",
"eventId": "event-cloud-connected",
"type": "GENERIC",
"eventState": "ACTIVE",
"severity": "MEDIUM",
"displayName": "Device Connected"
}
],
"nextToken": "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7InBhcnRpdGlvbl9rZXkiOnsic..."
}
}
}

❌ Error Response

{
"errors": [
{
"message": "Event not found",
"locations": [{"line": 3, "column": 5}],
"path": ["devicesEventsList"],
"extensions": {
"code": "EVENT_NOT_FOUND",
"exception": {
"stacktrace": ["Error: Event not found", " at ..."]
}
}
}
],
"data": null
}

📄 Pagination

For paginated results, use the nextToken from the response in subsequent requests:

query GetMoreEvents {
devicesEventsList(
deviceId: "DEVICE-ABC123-XYZ789"
period: {
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
}
nextToken: "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7InBhcnRpdGlvbl9rZXkiOnsic..."
) {
events {
deviceId
timestamp
eventId
type
severity
}
nextToken
}
}

📊 Data Service

    🚀 Built for: Real-time sauna monitoring and data analytics
    🔧 Tech Stack: GraphQL, AWS Lambda, AWS IAM, Amazon Cognito
    📊 Data Sources: AWS Timestream, InfluxDB, Amazon S3

🏷️ Enums
📊 SamplingMode

Defines how measurement data should be sampled:
Value Description Use Case
NONE 📈 No sampling, return all data points Real-time monitoring
SAMPLING ⏱️ Sample data points at regular intervals Performance optimization
AVERAGE 📊 Calculate average values for intervals Data analysis
🗄️ DatabaseType

Specifies which database to use for queries:
Value Description Best For
timestream ⚡ AWS Timestream database High-frequency IoT data
influxdb 📈 InfluxDB database Time-series analytics
🌐 REST API

Note: All REST API endpoints require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the REST API base URL from the endpoints configuration: endpoints.RestApi.data.https
📊 GET /data/latest-data

    Retrieves the most recent measurements for a specific device and cabin.

Arguments:
Parameter Type Required Description
deviceId string ✅ AWS IoT Thing name
cabinId string ⚪ Sub-shadow identifier (e.g., C1). Mutually exclusive with cabinName
cabinName string ⚪ Friendly cabin name advertised by the device. Mutually exclusive with cabinId

Notes:

    If neither cabinId nor cabinName is provided, cabinId defaults to C1.

Success Response (200):

{
"deviceId": "ABC123",
"shadowName": "C1",
"subId": "C1",
"timestamp": "2025-01-01T00:00:00.000Z",
"sessionId": "session-123",
"type": "HEATER",
"organization": "org-1",
"data": {
"temperature": 65.4,
"humidity": 32.1
}
}

Error Response:

{
"error": "string",
"message": "string"
}

📈 GET /data/telemetry-history

    Retrieves a paginated list of measurements for a specific device and cabin within a time range.

Arguments:
Parameter Type Required Description
deviceId string ✅ AWS IoT Thing name
cabinId string ⚪ Cabin/sub-shadow identifier (e.g., C1). Mutually exclusive with cabinName
cabinName string ⚪ Friendly cabin name. Mutually exclusive with cabinId
startTimestamp string ✅ Start of time range (ISO8601 string or epoch millis, inclusive)
endTimestamp string ✅ End of time range (ISO8601 string or epoch millis, inclusive, must be ≥ startTimestamp)
samplingMode string ⚪ Sampling mode: none, sampling, or average
sampleAmount integer ⚪ Number of samples (required if samplingMode is supplied)
nextToken string ⚪ Pagination token for continuing from a previous response

Notes:

    If neither cabinId nor cabinName is provided, cabinId defaults to C1.
    Omit samplingMode to retrieve raw measurements.

Success Response (200):

{
"deviceId": "ABC123",
"shadowName": "C1",
"measurements": [
{
"deviceId": "ABC123",
"subId": "C1",
"timestamp": "1700000000000",
"organizationId": "org-1",
"deviceCanSee": ["org-1"],
"data": {
"temperature": 64.2,
"humidity": 31.4
},
"sessionId": "session-123",
"type": "HEATER"
}
],
"nextToken": "eyJwYWdlIjoiMiJ9"
}

Error Response:

{
"error": "string",
"message": "string"
}

💡 REST API Examples

Each example below shows the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.
🟨 Using JavaScript/fetch

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiBase = endpoints.RestApi.data.https;
const restApiGenerics = endpoints.RestApi.generics.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

async function call(method, path) {
const res = await fetch(`${restApiBase}${path}`, {
method,
headers: { Authorization: `Bearer ${idToken}` },
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
return res.json();
}

// Fetch latest data for device ABC123, cabin C1
const latestData = await call("GET", `/data/latest-data?deviceId=ABC123&cabinId=C1`);
console.log(latestData);

// Fetch telemetry history for the same device between two timestamps
const start = new Date("2025-01-01T00:00:00.000Z").toISOString();
const end = new Date("2025-01-02T00:00:00.000Z").toISOString();
const telemetryHistory = await call(
"GET",
`/data/telemetry-history?deviceId=ABC123&cabinId=C1&startTimestamp=${encodeURIComponent(start)}&endTimestamp=${encodeURIComponent(end)}&samplingMode=average&sampleAmount=60`
);
console.log(telemetryHistory);

🐍 Using Python/requests

import requests

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_base = endpoints["RestApi"]["data"]["https"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def call(method, path):
res = requests.request(method, f"{rest_api_base}{path}", headers={"Authorization": f"Bearer {id_token}"})
if not res.ok:
raise Exception(f"{res.status_code} {res.text}")
return res.json()

# Fetch latest data for device ABC123, cabin C1

latest_data = call("GET", "/data/latest-data?deviceId=ABC123&cabinId=C1")
print(latest_data)

# Fetch telemetry history for the same device between two timestamps

start = "2025-01-01T00:00:00.000Z"
end = "2025-01-02T00:00:00.000Z"
telemetry_history = call(
"GET",
f"/data/telemetry-history?deviceId=ABC123&cabinId=C1&startTimestamp={start}&endTimestamp={end}&samplingMode=average&sampleAmount=60"
)
print(telemetry_history)

🔧 Using cURL

# Get endpoints and authenticate

ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_BASE=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.data.https')
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
 --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

# Fetch latest data for device ABC123, cabin C1

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     "$REST_API_BASE/data/latest-data?deviceId=ABC123&cabinId=C1" | jq '.'

START_ISO="2025-01-01T00:00:00.000Z"
END_ISO="2025-01-02T00:00:00.000Z"

# Fetch telemetry history for the same device between two timestamps

curl -sS -H "Authorization: Bearer $ID_TOKEN" \
     "$REST_API_BASE/data/telemetry-history?deviceId=ABC123&cabinId=C1&startTimestamp=$START_ISO&endTimestamp=$END_ISO&samplingMode=average&sampleAmount=60" | jq '.'

🔵 GraphQL

The Data Service provides GraphQL queries and subscriptions for accessing device data.

Note: All GraphQL requests require a Cognito ID token in the Authorization: Bearer <idToken> header. See the API Overview section for authentication setup.

Base URL: Get the GraphQL endpoint from the endpoints configuration: endpoints.GraphQL.data.https
🔍 Queries
📋 devicesMeasurementsList

    Retrieves a paginated list of measurements for a specific device within a time range.

Arguments:
Parameter Type Required Description
deviceId String! ✅ The ID of the device
startTimestamp String! ✅ Start of the time range
endTimestamp String! ✅ End of the time range
samplingMode SamplingMode ⚪ How to sample the data
sampleAmount Int ⚪ Number of samples to return
db DatabaseType ⚪ Database to query
nextToken String ⚪ Pagination token

Returns: MeasurementItems - List of measurements with pagination support

Example:

query GetDeviceMeasurements {
devicesMeasurementsList(
deviceId: "DEVICE-ABC123-XYZ789"
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
samplingMode: AVERAGE
sampleAmount: 100
) {
measurementItems {
deviceId
subId
timestamp
sessionId
type
data
}
nextToken
}
}

📄 devicesMeasurementsPdfGenerate

    Generates a PDF report of device measurements.

Arguments:
Parameter Type Required Description
deviceId String! ✅ The ID of the device
startTimestamp String! ✅ Start of the time range
endTimestamp String! ✅ End of the time range
samplingMode SamplingMode ⚪ How to sample the data
sampleAmount Int ⚪ Number of samples to return
db DatabaseType ⚪ Database to query

Returns: PdfReportLink - URL to the generated PDF report

Example:

query GeneratePdfReport {
devicesMeasurementsPdfGenerate(
deviceId: "DEVICE-ABC123-XYZ789"
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
samplingMode: AVERAGE
sampleAmount: 1000
) {
url
}
}

⚡ devicesMeasurementsLatest

    Retrieves the most recent measurements for a device.

Arguments:
Parameter Type Required Description
deviceId String! ✅ The ID of the device

Returns: [MeasurementItem] - Array of latest measurements

Example:

query GetLatestMeasurements {
devicesMeasurementsLatest(
deviceId: "DEVICE-ABC123-XYZ789"
) {
deviceId
subId
timestamp
sessionId
type
data
}
}

🎯 devicesSessionsList

    Retrieves a list of sessions for a specific device.

Arguments:
Parameter Type Required Description
deviceId String! ✅ The ID of the device
startTimestamp AWSDateTime! ✅ Start of the time range
endTimestamp AWSDateTime! ✅ End of the time range
nextToken String ⚪ Pagination token

Returns: SessionItems - List of sessions with pagination support

Example:

query GetDeviceSessions {
devicesSessionsList(
deviceId: "DEVICE-ABC123-XYZ789"
startTimestamp: "2025-01-01T00:00:00.000Z"
endTimestamp: "2025-01-02T00:00:00.000Z"
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

🏢 organizationsSessionsList

    Retrieves a list of sessions for all devices in an organization.

Arguments:
Parameter Type Required Description
organizationId String! ✅ The ID of the organization
startTimestamp AWSDateTime! ✅ Start of the time range
endTimestamp AWSDateTime! ✅ End of the time range
nextToken String ⚪ Pagination token

Returns: SessionItems - List of sessions with pagination support

Example:

query GetOrganizationSessions {
organizationsSessionsList(
organizationId: "ORG-PROD-001"
startTimestamp: "2025-01-01T00:00:00.000Z"
endTimestamp: "2025-01-02T00:00:00.000Z"
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

💻 HTTP Request Examples

The following examples show how to make GraphQL queries using HTTP. Each example includes the complete authentication flow. For detailed authentication setup, token refresh, and error handling, see the API Overview section.
🟨 Using JavaScript/fetch

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.data.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

const query = `  query GetDeviceMeasurements {
    devicesMeasurementsLatest(
      deviceId: "DEVICE-ABC123-XYZ789"
    ) {
      deviceId
      subId
      timestamp
      sessionId
      type
      data
    }
  }`;

const graphqlResponse = await fetch(graphqlEndpoint, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${idToken}`
},
body: JSON.stringify({ query })
});

const data = await graphqlResponse.json();
console.log(data);

🐍 Using Python/requests

import requests

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["data"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

query = """
query GetDeviceMeasurements {
devicesMeasurementsLatest(
deviceId: "DEVICE-ABC123-XYZ789"
) {
deviceId
subId
timestamp
sessionId
type
data
}
}
"""

response = requests.post(
graphql_endpoint,
headers={
'Content-Type': 'application/json',
'Authorization': f"Bearer {id_token}"
},
json={'query': query}
)

data = response.json()
print(data)

🔧 Using cURL

# Get endpoints and authenticate

ENDPOINTS=$(curl -sS "https://prod.api.harvia.io/endpoints")
REST_API_GENERICS=$(echo "$ENDPOINTS" | jq -r '.endpoints.RestApi.generics.https')
GRAPHQL=$(echo "$ENDPOINTS" | jq -r '.endpoints.GraphQL.data.https')

TOKEN_RESPONSE=$(curl -sS -H "Content-Type: application/json" \
  -X POST "$REST_API_GENERICS/auth/token" \
 --data '{"username":"your-username","password":"your-password"}')

ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.idToken')

QUERY='{"query":"query GetDeviceMeasurements {\\n devicesMeasurementsLatest(\\n deviceId: \"DEVICE-ABC123-XYZ789\"\\n ) {\\n deviceId\\n subId\\n timestamp\\n sessionId\\n type\\n data\\n }\\n}"}'

curl -sS -H "Content-Type: application/json" \
 -H "Authorization: Bearer $ID_TOKEN" \
  -X POST "$GRAPHQL" \
 --data "$QUERY" | jq '.'

📡 Subscriptions

    ⚠️ Important: Subscriptions are more complex than queries/mutations as they require WebSocket connections.

🔧 Setup Requirements

JavaScript/Node.js:

npm install aws-appsync aws-appsync-auth-link graphql graphql-tag

Note: aws-appsync requires graphql version 14.x or 15.0.0–15.3.0 (not 16+). If you encounter compatibility issues, install with: npm install aws-appsync aws-appsync-auth-link graphql@14 graphql-tag

Python:

pip install requests websocket-client

Note: Use the Cognito IdToken obtained via the REST API (see API Overview). Get endpoints from the Endpoints API; the client URL comes from endpoints.GraphQL.data.https. The receiver must be the JWT claim cognito:username from your IdToken.
🔔 devicesMeasurementsUpdateFeed

    Real-time feed of measurement updates.

Arguments:
Parameter Type Required Description
receiver ID! ✅ The ID of the receiver

Returns: MeasurementUpdateNotice - Real-time updates of measurements

Example:

subscription SubscribeToMeasurements {
devicesMeasurementsUpdateFeed(receiver: "user-abc-123-def-456") {
receiver
item {
deviceId
subId
timestamp
sessionId
type
data
}
}
}

📊 Subscription Examples

The following examples show complete subscription setup including authentication. For detailed authentication setup and token management, see the API Overview section.
🟨 Using JavaScript/Node.js

import { AWSAppSyncClient } from "aws-appsync";
import { AUTH_TYPE } from "aws-appsync-auth-link";
import gql from "graphql-tag";

// Get endpoints and authenticate
const response = await fetch("https://prod.api.harvia.io/endpoints");
const { endpoints } = await response.json();
const restApiGenerics = endpoints.RestApi.generics.https;
const graphqlEndpoint = endpoints.GraphQL.data.https;

const tokens = await fetch(`${restApiGenerics}/auth/token`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username: "your-username", password: "your-password" }),
}).then(r => r.json());

const idToken = tokens.idToken;

// Extract user ID from JWT token (required for receiver argument)
const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8'));
const userId = tokenPayload['cognito:username'];

// Create AppSync client
const client = new AWSAppSyncClient({
url: graphqlEndpoint,
region: "eu-central-1",
auth: {
type: AUTH_TYPE.AWS_LAMBDA,
token: async () => `Bearer ${idToken}`,
},
disableOffline: true,
});

// Subscribe to measurements feed
const subscription = client.subscribe({
query: gql`    subscription MeasurementsFeed {
      devicesMeasurementsUpdateFeed(receiver: "${userId}") {
        receiver
        item {
          deviceId
          subId
          timestamp
          sessionId
          type
          data
        }
      }
    }
 `
});

subscription.subscribe({
next: (data) => console.log("Received measurement:", data),
error: (error) => console.error("Error:", error)
});

🐍 Using Python/requests

import json
import base64
import websocket
import requests
from uuid import uuid4

# Get endpoints and authenticate

response = requests.get("https://prod.api.harvia.io/endpoints")
endpoints = response.json()["endpoints"]
rest_api_generics = endpoints["RestApi"]["generics"]["https"]
graphql_endpoint = endpoints["GraphQL"]["data"]["https"]

tokens = requests.post(
f"{rest_api_generics}/auth/token",
headers={"Content-Type": "application/json"},
json={"username": "your-username", "password": "your-password"}
).json()

id_token = tokens["idToken"]

def header_encode(header_obj):
"""Encode header using Base 64"""
return base64.b64encode(json.dumps(header_obj).encode('utf-8')).decode('utf-8')

# Extract user ID from JWT token

token_payload = json.loads(base64.b64decode(id_token.split('.')[1] + '==').decode('utf-8'))
user_id = token_payload['cognito:username']

# Build WebSocket URL and host

wss_url = graphql_endpoint.replace('https', 'wss').replace('appsync-api', 'appsync-realtime-api')
host = graphql_endpoint.replace('https://', '').replace('/graphql', '')

# Generate subscription ID

sub_id = str(uuid4())

# Create JWT authentication header

auth_header = {
'host': host,
'Authorization': f"Bearer {id_token}"
}

# GraphQL subscription

gql_subscription = json.dumps({
'query': f'subscription MeasurementsFeed {{ devicesMeasurementsUpdateFeed(receiver: "{user_id}") {{ receiver item {{ deviceId subId timestamp sessionId type data }} }} }}',
'variables': {}
})

# WebSocket event callbacks

def on_message(ws, message):
message_object = json.loads(message)
message_type = message_object['type']

    if message_type == 'connection_ack':
        # Register subscription
        register = {
            'id': sub_id,
            'payload': {
                'data': gql_subscription,
                'extensions': {'authorization': auth_header}
            },
            'type': 'start'
        }
        ws.send(json.dumps(register))

    elif message_type == 'start_ack':
        print("✅ Subscription registered successfully")

    elif message_type == 'data':
        print("✅ Received subscription data:", message_object['payload'])
        # Stop subscription
        ws.send(json.dumps({'type': 'stop', 'id': sub_id}))

def on_open(ws):
ws.send(json.dumps({'type': 'connection_init'}))

# Create WebSocket connection

connection_url = wss_url + '?header=' + header_encode(auth_header) + '&payload=e30='
ws = websocket.WebSocketApp(
connection_url,
subprotocols=['graphql-ws'],
on_open=on_open,
on_message=on_message
)

# Run WebSocket (use proper threading/timeout handling)

ws.run_forever()

📋 Types
🔄 MeasurementUpdate

    Input type for measurement updates

Field Type Required Description
deviceId String! ✅ The ID of the device
subId String! ✅ The ID of the subsystem
timestamp String! ✅ Timestamp of the measurement
sessionId String ⚪ ID of the session
type String ⚪ Type of the measurement
data AWSJSON ⚪ JSON data of the measurement
📮 MeasurementUpdateNotice

    Measurement update notifications

Field Type Required Description
receiver ID! ✅ The ID of the receiver
item MeasurementItem! ✅ The updated measurement
🔥 Session

    Sauna session representation

Field Type Required Description
deviceId String! ✅ The ID of the device
sessionId String! ✅ The ID of the session
organizationId String! ✅ The ID of the organization
subId String! ✅ The ID of the subsystem
timestamp AWSDateTime! ✅ Timestamp of the session
type String ⚪ Type of the session
durationMs Float ⚪ Duration in milliseconds
stats AWSJSON ⚪ Session statistics
📊 SessionItems

    Paginated session results

Field Type Required Description
sessions [Session!]! ✅ List of sessions
nextToken String ⚪ Pagination token
📈 MeasurementItem

    Single measurement

Field Type Required Description
deviceId String! ✅ The ID of the device
subId String! ✅ The ID of the subsystem
timestamp String! ✅ Timestamp of the measurement
sessionId String ⚪ ID of the session
type String ⚪ Type of the measurement
data AWSJSON ⚪ JSON data of the measurement
📋 MeasurementItems

    Paginated measurement results

Field Type Required Description
measurementItems [MeasurementItem!]! ✅ List of measurements
nextToken String ⚪ Pagination token
📄 PdfReportLink

    PDF report link

Field Type Required Description
url String ⚪ URL to the generated PDF report
📋 Sample Responses
✅ Successful Query Response

{
"data": {
"devicesMeasurementsList": {
"measurementItems": [
{
"deviceId": "DEVICE-ABC123-XYZ789",
"subId": "C1",
"timestamp": "1735689600000",
"sessionId": "session-456",
"type": "temperature",
"data": "{\"temp\": 80, \"hum\": 20, \"targetTemp\": 90}"
}
],
"nextToken": "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7InBhcnRpdGlvbl9rZXkiOnsic..."
}
}
}

❌ Error Response

{
"errors": [
{
"message": "Device not found",
"locations": [{"line": 3, "column": 5}],
"path": ["devicesMeasurementsList"],
"extensions": {
"code": "DEVICE_NOT_FOUND",
"exception": {
"stacktrace": ["Error: Device not found", " at ..."]
}
}
}
],
"data": null
}

📄 Pagination

For paginated results, use the nextToken from the response in subsequent requests:

query GetMoreMeasurements {
devicesMeasurementsList(
deviceId: "DEVICE-ABC123-XYZ789"
startTimestamp: "1735689600000"
endTimestamp: "1735776000000"
nextToken: "eyJsYXN0RXZhbHVhdGVkS2V5Ijp7InBhcnRpdGlvbl9rZXkiOnsic..."
) {
measurementItems {
deviceId
subId
timestamp
data
}
nextToken
}
}
