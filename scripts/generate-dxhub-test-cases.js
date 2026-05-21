/**
 * Generates DXHub API test cases (JSON + Excel) from Postman collection metadata + schema rules.
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const PROJECT_ROOT = path.join(__dirname, "..");
/** Per-API outputs live here (6 APIs → 6 Excel + 6 JSON). */
const TEST_CASES_DIR = path.join(PROJECT_ROOT, "test-cases");

/** Order and folder slug for each API in the Postman collection. */
const API_GROUPS = [
  { feature: "Login API", slug: "login-api", sheetTitle: "Login API Tests" },
  {
    feature: "Provider Plan List API",
    slug: "provider-plan-list-api",
    sheetTitle: "Provider Plan List Tests",
  },
  { feature: "Create Plan API", slug: "create-plan-api", sheetTitle: "Create Plan Tests" },
  { feature: "Edit Plan API", slug: "edit-plan-api", sheetTitle: "Edit Plan Tests" },
  { feature: "Delete Plan API", slug: "delete-plan-api", sheetTitle: "Delete Plan Tests" },
  {
    feature: "Plan Detailed View API",
    slug: "plan-detailed-view-api",
    sheetTitle: "Plan Detailed View Tests",
  },
];

const BASE = {
  login: "https://dxhub-dev-api.innovaturelabs.net/api/v1/login",
  planProvidersList: "https://dxhub-dev-api.innovaturelabs.net/api/v1/plan/providers",
  planProvider: "https://dev-console-api.jpmob.jp/api/v1/plan/provider",
  planProviderById: (id) =>
    `https://dev-console-api.jpmob.jp/api/v1/plan/provider/${id}`,
};

const VALID_BODY = {
  provider: 9,
  plan_name: "ValidPlanName",
  plan_code: "VALID_CODE",
  type: 1,
  plan_type: 1,
  billing_type: 1,
  description: "Valid description",
};

function str(n) {
  return "A".repeat(n);
}

function tc(
  id,
  description,
  feature,
  subFeature,
  steps,
  pre,
  expected,
  meta = {}
) {
  return {
    testCaseId: id,
    testCaseDescription: description,
    feature,
    subFeature,
    testSteps: steps,
    preCondition: pre,
    expectedResult: expected,
    status: "Not Executed",
    ...meta,
  };
}

const stepsDefault = (method, url, headersNote, bodyNote, auth = true) =>
  [
    "1. Open API testing tool or automation environment.",
    `2. Enter API endpoint: ${url}.`,
    `3. Select HTTP method: ${method}.`,
    `4. Set request headers: ${headersNote}.`,
    auth
      ? "5. Provide authentication token as per test (DXHUB <access_token> in Authorization header when required)."
      : "5. Omit or manipulate Authorization header as per test case.",
    bodyNote
      ? `6. Enter request payload: ${bodyNote}`
      : "6. Send request without body or with body as specified in this test case.",
    "7. Send the API request.",
    "8. Verify HTTP status code and response body against Expected Result.",
  ].join("\n");

function buildCases() {
  const cases = [];
  let n = 0;
  const push = (c) => {
    n += 1;
    cases.push({ slNo: n, ...c });
  };

  // ---------- Login ----------
  const loginHeaders =
    "Content-Type: application/json; Accept: application/json";
  const loginBody = '{"email":"<value>","password":"<value>"}';

  push(
    tc(
      "API_TC_001",
      "Verify that the Login API returns success when valid email and password are provided.",
      "Login API",
      "Success Response",
      stepsDefault("POST", BASE.login, loginHeaders, loginBody, false),
      "Valid user account exists in the system. API service is available.",
      "The API should return HTTP 200 with Content-Type application/json. The response body should indicate successful authentication and include an access token (or equivalent auth payload) suitable for subsequent authorized requests.",
      { endpoint: BASE.login, method: "POST", samplePayload: { email: "user@example.com", password: "Secret@123" } }
    )
  );

  push(
    tc(
      "API_TC_002",
      "Verify that an error response is returned when the email field is missing from the Login request body.",
      "Login API",
      "Missing Parameter",
      stepsDefault("POST", BASE.login, loginHeaders, "JSON without email field", false),
      "API service is available.",
      "The API should return HTTP 400 (or 422) with an error message indicating that the email field is required or the request is invalid.",
      { endpoint: BASE.login, method: "POST", samplePayload: { password: "x" } }
    )
  );

  push(
    tc(
      "API_TC_003",
      "Verify that an error response is returned when the email field is null in the Login request body.",
      "Login API",
      "Required Validation",
      stepsDefault("POST", BASE.login, loginHeaders, '{"email":null,"password":"x"}', false),
      "API service is available.",
      "The API should return HTTP 400 (or 422) with validation indicating email cannot be null or is invalid.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_004",
      "Verify that an error response is returned when the email field is an empty string in the Login request body.",
      "Login API",
      "Required Validation",
      stepsDefault("POST", BASE.login, loginHeaders, '{"email":"","password":"x"}', false),
      "API service is available.",
      "The API should return HTTP 400 (or 422) with an error indicating email is required or invalid.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_005",
      "Verify that an error response is returned when the password field is missing from the Login request body.",
      "Login API",
      "Missing Parameter",
      stepsDefault("POST", BASE.login, loginHeaders, '{"email":"a@b.com"}', false),
      "API service is available.",
      "The API should return HTTP 400 (or 422) indicating password is required.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_006",
      "Verify that an error response is returned when the password field is null in the Login request body.",
      "Login API",
      "Required Validation",
      stepsDefault("POST", BASE.login, loginHeaders, '{"email":"a@b.com","password":null}', false),
      "API service is available.",
      "The API should return HTTP 400 (or 422) with validation error for password.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_007",
      "Verify that an error response is returned when incorrect credentials are submitted to the Login API.",
      "Login API",
      "Invalid Credentials",
      stepsDefault("POST", BASE.login, loginHeaders, "valid JSON with wrong password", false),
      "API service is available. Known invalid password for the test email.",
      "The API should return HTTP 401 (or 400) with an error message indicating authentication failed. No valid access token should be issued.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_008",
      "Verify that an error response is returned when the Login request body is malformed JSON.",
      "Login API",
      "Malformed JSON",
      stepsDefault("POST", BASE.login, loginHeaders, "invalid JSON string", false),
      "API service is available.",
      "The API should return HTTP 400 with an error indicating malformed JSON or invalid request body.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_009",
      "Verify that an error response is returned when the Login API is invoked with HTTP GET instead of POST.",
      "Login API",
      "HTTP Method Validation",
      stepsDefault("GET", BASE.login, loginHeaders, "none", false),
      "API service is available.",
      "The API should return HTTP 405 Method Not Allowed or 404 as per implementation, and must not perform login.",
      { endpoint: BASE.login, method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_010",
      "Verify that an error response is returned when Content-Type is not application/json for the Login API.",
      "Login API",
      "Header Validation",
      "1. Open API testing tool.\n2. POST to Login endpoint.\n3. Set Content-Type to text/plain.\n4. Send JSON body.\n5. Verify response.",
      "API service is available.",
      "The API should return HTTP 415 Unsupported Media Type or 400 indicating unsupported content type, per server configuration.",
      { endpoint: BASE.login, method: "POST" }
    )
  );

  // ---------- Provider plan list ----------
  const listUrl = BASE.planProvidersList;
  push(
    tc(
      "API_TC_011",
      "Verify that the Provider plan list API returns a successful response when called with a valid access token.",
      "Provider Plan List API",
      "Success Response",
      stepsDefault("GET", listUrl, "Authorization: DXHUB <token>; Accept: application/json", "no body"),
      "Valid API access token exists. API service is available.",
      "The API should return HTTP 200 with Content-Type application/json. The response body should contain a list structure for provider plans (array or paginated object) with expected fields per API contract.",
      { endpoint: listUrl, method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_012",
      "Verify that the Provider plan list API returns an error when the Authorization header is missing.",
      "Provider Plan List API",
      "Authentication",
      stepsDefault("GET", listUrl, "no Authorization header", "no body", false),
      "API service is available.",
      "The API should return HTTP 401 Unauthorized with an error indicating authentication is required.",
      { endpoint: listUrl, method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_013",
      "Verify that the Provider plan list API returns an error when an invalid access token is supplied.",
      "Provider Plan List API",
      "Invalid Token",
      stepsDefault("GET", listUrl, "Authorization: DXHUB invalid_token", "no body", false),
      "API service is available.",
      "The API should return HTTP 401 Unauthorized with an error indicating the token is invalid.",
      { endpoint: listUrl, method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_014",
      "Verify that the Provider plan list API returns an error when an expired access token is supplied.",
      "Provider Plan List API",
      "Expired Token",
      stepsDefault("GET", listUrl, "Authorization: DXHUB <expired_token>", "no body", false),
      "An expired JWT or access token is available for testing.",
      "The API should return HTTP 401 Unauthorized with an error indicating the token is expired or invalid.",
      { endpoint: listUrl, method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_015",
      "Verify that the Provider plan list API rejects a POST request to the same URL.",
      "Provider Plan List API",
      "HTTP Method Validation",
      stepsDefault("POST", listUrl, "Authorization: DXHUB <valid_token>", "empty JSON object {}"),
      "Valid API access token exists.",
      "The API should return HTTP 405 Method Not Allowed or 404, and must not return the list as for GET.",
      { endpoint: listUrl, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_016",
      "Verify that the Provider plan list API response schema contains the expected top-level fields and data types.",
      "Provider Plan List API",
      "Response Schema Validation",
      stepsDefault("GET", listUrl, "Authorization: DXHUB <valid_token>", "no body"),
      "Valid API access token exists. At least one plan exists or empty list is valid.",
      "The API should return HTTP 200. Each list item should expose fields consistent with provider plan entities (identifiers, names, codes as applicable) with correct JSON types.",
      { endpoint: listUrl, method: "GET" }
    )
  );

  // ---------- Create plan (field + API level) ----------
  const createUrl = BASE.planProvider;
  const authNote =
    "Authorization: DXHUB <valid_token>; Content-Type: application/json; Accept: application/json";

  const addCreate = (id, desc, sub, body, pre, exp, extra = {}) => {
    let bodyNote = "JSON body per test case";
    if (body && typeof body === "object") {
      const s = JSON.stringify(body);
      bodyNote =
        s.length > 1200 ? `${s.slice(0, 1200)}... (truncated in steps; full in samplePayload)` : s;
    } else if (typeof body === "string" && body !== "N/A") {
      bodyNote = body;
    }
    push(
      tc(
        id,
        desc,
        "Create Plan API",
        sub,
        stepsDefault("POST", createUrl, authNote, bodyNote),
        pre,
        exp,
        {
          endpoint: createUrl,
          method: "POST",
          ...(typeof body === "object" && body !== null ? { samplePayload: body } : {}),
          ...extra,
        }
      )
    );
  };

  addCreate(
    "API_TC_017",
    "Verify that the Create Plan API returns success when all required fields are valid according to the schema.",
    "Success Response",
    { ...VALID_BODY },
    "Valid API access token exists. Provider ID 9 (or a valid provider from environment) exists.",
    "The API should return HTTP 201 or 200 with Content-Type application/json. The response should include the created plan identifier and persisted field values matching the request."
  );

  addCreate(
    "API_TC_018",
    "Verify that an error is returned when provider is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.provider;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 with an error indicating provider is required.",
    {}
  );

  addCreate(
    "API_TC_019",
    "Verify that an error is returned when provider is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, provider: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating provider is invalid or required.",
    {}
  );

  addCreate(
    "API_TC_020",
    "Verify that an error is returned when provider has an invalid data type (string) in the Create Plan request body.",
    "Data Type Validation",
    { ...VALID_BODY, provider: "9" },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating provider must be an integer.",
    {}
  );

  addCreate(
    "API_TC_021",
    "Verify that an error is returned when provider references a non-existent provider ID in the Create Plan request body.",
    "Logical Validation",
    { ...VALID_BODY, provider: 999999999 },
    "Valid API access token exists. Provider ID 999999999 does not exist.",
    "The API should return HTTP 400 or 404 with an error indicating the provider is not found or invalid.",
    {}
  );

  addCreate(
    "API_TC_022",
    "Verify that an error is returned when plan_name is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.plan_name;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_name is required.",
    {}
  );

  addCreate(
    "API_TC_023",
    "Verify that an error is returned when plan_name is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, plan_name: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_name is invalid.",
    {}
  );

  addCreate(
    "API_TC_024",
    "Verify that an error is returned when plan_name exceeds 250 characters in the Create Plan request body.",
    "Boundary Validation",
    { ...VALID_BODY, plan_name: str(251) },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_name exceeds maximum length of 250 characters.",
    {}
  );

  addCreate(
    "API_TC_025",
    "Verify that the Create Plan API accepts plan_name with length exactly equal to 250 characters.",
    "Boundary Validation",
    { ...VALID_BODY, plan_name: str(250) },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist plan_name of 250 characters.",
    {}
  );

  addCreate(
    "API_TC_026",
    "Verify that an error is returned when plan_code is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.plan_code;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_code is required.",
    {}
  );

  addCreate(
    "API_TC_027",
    "Verify that an error is returned when plan_code is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, plan_code: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_code is invalid.",
    {}
  );

  addCreate(
    "API_TC_028",
    "Verify that an error is returned when plan_code exceeds 100 characters in the Create Plan request body.",
    "Boundary Validation",
    { ...VALID_BODY, plan_code: str(101) },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_code exceeds maximum length of 100 characters.",
    {}
  );

  addCreate(
    "API_TC_029",
    "Verify that the Create Plan API accepts plan_code with length exactly equal to 100 characters.",
    "Boundary Validation",
    { ...VALID_BODY, plan_code: str(100) },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist plan_code of 100 characters.",
    {}
  );

  addCreate(
    "API_TC_030",
    "Verify that an error is returned when type is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.type;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating type is required.",
    {}
  );

  addCreate(
    "API_TC_031",
    "Verify that an error is returned when type is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, type: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating type is invalid.",
    {}
  );

  addCreate(
    "API_TC_032",
    "Verify that an error is returned when type has an unsupported integer value (not 1 or 2) in the Create Plan request body.",
    "Logical Validation",
    { ...VALID_BODY, type: 99 },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating type must be 1 (Origin) or 2 (Recharge).",
    {}
  );

  addCreate(
    "API_TC_033",
    "Verify that an error is returned when type has invalid data type (string) in the Create Plan request body.",
    "Data Type Validation",
    { ...VALID_BODY, type: "1" },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating type must be an integer.",
    {}
  );

  addCreate(
    "API_TC_034",
    "Verify that the Create Plan API accepts type value 1 (Origin).",
    "Logical Validation",
    { ...VALID_BODY, type: 1 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist type as Origin (1).",
    {}
  );

  addCreate(
    "API_TC_035",
    "Verify that the Create Plan API accepts type value 2 (Recharge).",
    "Logical Validation",
    { ...VALID_BODY, type: 2 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist type as Recharge (2).",
    {}
  );

  addCreate(
    "API_TC_036",
    "Verify that an error is returned when plan_type is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.plan_type;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_type is required.",
    {}
  );

  addCreate(
    "API_TC_037",
    "Verify that an error is returned when plan_type is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, plan_type: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_type is invalid.",
    {}
  );

  addCreate(
    "API_TC_038",
    "Verify that an error is returned when plan_type has an unsupported value (not 1, 2, or 3) in the Create Plan request body.",
    "Logical Validation",
    { ...VALID_BODY, plan_type: 10 },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating plan_type must be 1 (Data), 2 (Voice), or 3 (Combo).",
    {}
  );

  addCreate(
    "API_TC_039",
    "Verify that the Create Plan API accepts plan_type value 1 (Data).",
    "Logical Validation",
    { ...VALID_BODY, plan_type: 1 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist plan_type as Data.",
    {}
  );

  addCreate(
    "API_TC_040",
    "Verify that the Create Plan API accepts plan_type value 2 (Voice).",
    "Logical Validation",
    { ...VALID_BODY, plan_type: 2 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist plan_type as Voice.",
    {}
  );

  addCreate(
    "API_TC_041",
    "Verify that the Create Plan API accepts plan_type value 3 (Combo).",
    "Logical Validation",
    { ...VALID_BODY, plan_type: 3 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist plan_type as Combo.",
    {}
  );

  addCreate(
    "API_TC_042",
    "Verify that an error is returned when billing_type is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.billing_type;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating billing_type is required.",
    {}
  );

  addCreate(
    "API_TC_043",
    "Verify that an error is returned when billing_type is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, billing_type: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating billing_type is invalid.",
    {}
  );

  addCreate(
    "API_TC_044",
    "Verify that an error is returned when billing_type has an unsupported value (not 1 or 2) in the Create Plan request body.",
    "Logical Validation",
    { ...VALID_BODY, billing_type: 5 },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating billing_type must be 1 (Prepaid) or 2 (Postpaid).",
    {}
  );

  addCreate(
    "API_TC_045",
    "Verify that the Create Plan API accepts billing_type value 1 (Prepaid).",
    "Logical Validation",
    { ...VALID_BODY, billing_type: 1 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist billing_type as Prepaid.",
    {}
  );

  addCreate(
    "API_TC_046",
    "Verify that the Create Plan API accepts billing_type value 2 (Postpaid).",
    "Logical Validation",
    { ...VALID_BODY, billing_type: 2 },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist billing_type as Postpaid.",
    {}
  );

  addCreate(
    "API_TC_047",
    "Verify that an error is returned when description is missing from the Create Plan request body.",
    "Missing Parameter",
    (() => {
      const b = { ...VALID_BODY };
      delete b.description;
      return b;
    })(),
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating description is required.",
    {}
  );

  addCreate(
    "API_TC_048",
    "Verify that an error is returned when description is null in the Create Plan request body.",
    "Required Validation",
    { ...VALID_BODY, description: null },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating description is invalid.",
    {}
  );

  addCreate(
    "API_TC_049",
    "Verify that an error is returned when description exceeds 255 characters in the Create Plan request body.",
    "Boundary Validation",
    { ...VALID_BODY, description: str(256) },
    "Valid API access token exists.",
    "The API should return HTTP 400 or 422 indicating description exceeds maximum length of 255 characters.",
    {}
  );

  addCreate(
    "API_TC_050",
    "Verify that the Create Plan API accepts description with length exactly equal to 255 characters.",
    "Boundary Validation",
    { ...VALID_BODY, description: str(255) },
    "Valid API access token exists.",
    "The API should return HTTP 201 or 200 and persist description of 255 characters.",
    {}
  );

  addCreate(
    "API_TC_051",
    "Verify that an error is returned when the Create Plan request contains unexpected extra fields not defined in the contract.",
    "Request Validation",
    { ...VALID_BODY, unexpected_field_xyz: true },
    "Valid API access token exists.",
    "The API should return HTTP 400 with an error about unexpected fields, or HTTP 200/201 if extra fields are ignored; result must match product specification (document actual behavior).",
    {}
  );

  push(
    tc(
      "API_TC_052",
      "Verify that an error is returned when the Create Plan request body is malformed JSON.",
      "Create Plan API",
      "Malformed JSON",
      [
        "1. Open API testing tool or automation environment.",
        `2. Enter API endpoint: ${createUrl}.`,
        "3. Select HTTP method: POST.",
        `4. Set request headers: ${authNote}.`,
        "5. Set raw body to a malformed JSON string (e.g. missing closing brace).",
        "6. Send the API request.",
        "7. Verify HTTP status code and error body.",
      ].join("\n"),
      "Valid API access token exists.",
      "The API should return HTTP 400 indicating malformed JSON.",
      { endpoint: createUrl, method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_053",
      "Verify that an error is returned when the Create Plan API is called without Authorization header.",
      "Create Plan API",
      "Authentication",
      [
        "1. Open API testing tool or automation environment.",
        `2. Enter API endpoint: ${createUrl}.`,
        "3. Select HTTP method: POST.",
        "4. Set Content-Type: application/json. Omit Authorization header.",
        "5. Enter valid JSON body: " + JSON.stringify(VALID_BODY) + ".",
        "6. Send the API request.",
        "7. Verify response.",
      ].join("\n"),
      "API service is available.",
      "The API should return HTTP 401 Unauthorized.",
      { endpoint: createUrl, method: "POST", samplePayload: VALID_BODY }
    )
  );

  push(
    tc(
      "API_TC_054",
      "Verify that an error is returned when the Create Plan API is called with an invalid access token.",
      "Create Plan API",
      "Invalid Token",
      [
        "1. Open API testing tool or automation environment.",
        `2. Enter API endpoint: ${createUrl}.`,
        "3. Select HTTP method: POST.",
        "4. Set Authorization: DXHUB invalid_token_string. Content-Type: application/json.",
        "5. Enter valid JSON body: " + JSON.stringify(VALID_BODY) + ".",
        "6. Send the API request.",
        "7. Verify response.",
      ].join("\n"),
      "API service is available.",
      "The API should return HTTP 401 Unauthorized.",
      { endpoint: createUrl, method: "POST", samplePayload: VALID_BODY }
    )
  );

  push(
    tc(
      "API_TC_055",
      "Verify that an error is returned when Content-Type is not application/json for the Create Plan API.",
      "Create Plan API",
      "Header Validation",
      [
        "1. Open API testing tool or automation environment.",
        `2. Enter API endpoint: ${createUrl}.`,
        "3. Select HTTP method: POST.",
        "4. Set Authorization with valid token. Set Content-Type to text/plain (not application/json).",
        "5. Send body as JSON string: " + JSON.stringify(VALID_BODY) + ".",
        "6. Send the API request.",
        "7. Verify response.",
      ].join("\n"),
      "Valid API access token exists.",
      "The API should return HTTP 415 Unsupported Media Type or 400 as per implementation.",
      { endpoint: createUrl, method: "POST", samplePayload: VALID_BODY }
    )
  );

  push(
    tc(
      "API_TC_056",
      "Verify that the Create Plan API rejects GET method on the create endpoint URL.",
      "Create Plan API",
      "HTTP Method Validation",
      [
        "1. Open API testing tool or automation environment.",
        `2. Enter API endpoint: ${createUrl}.`,
        "3. Select HTTP method: GET.",
        `4. Set request headers: ${authNote}.`,
        "5. Send the API request without body.",
        "6. Verify response.",
      ].join("\n"),
      "Valid API access token exists.",
      "The API should return HTTP 405 Method Not Allowed or 404.",
      { endpoint: createUrl, method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_057",
      "Verify that the Create Plan API returns a controlled error when the database or persistence layer is unavailable.",
      "Create Plan API",
      "Dependency Failure",
      stepsDefault("POST", createUrl, authNote, "valid JSON body"),
      "Valid API access token exists. Database dependency failure is simulated in test environment.",
      "The API should return HTTP 503 or 500 with a safe error message that does not leak internal details.",
      { endpoint: createUrl, method: "POST" }
    )
  );

  // ---------- Edit plan (PATCH) ----------
  const editUrl = BASE.planProviderById("{plan_id}");
  const editSteps = (bodyDesc) =>
    stepsDefault(
      "PATCH",
      editUrl,
      authNote,
      bodyDesc
    );

  push(
    tc(
      "API_TC_058",
      "Verify that the Edit Plan API updates successfully when plan_name is sent with a valid value (partial update).",
      "Edit Plan API",
      "Success Response",
      editSteps('{"plan_name":"UpdatedName"}'),
      "Valid API access token exists. A plan record exists with a known plan_id.",
      "The API should return HTTP 200 with Content-Type application/json. The response should reflect the updated plan_name.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH", samplePayload: { plan_name: "UpdatedName" } }
    )
  );

  push(
    tc(
      "API_TC_059",
      "Verify that the Edit Plan API updates successfully when all schema fields are sent with valid values.",
      "Edit Plan API",
      "Success Response",
      editSteps("full body matching create schema"),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 200 and persist all updated fields according to the request.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH", samplePayload: { ...VALID_BODY } }
    )
  );

  push(
    tc(
      "API_TC_060",
      "Verify that an error is returned when plan_id in the Edit Plan URL path is non-existent.",
      "Edit Plan API",
      "Logical Validation",
      editSteps('{"plan_name":"X"}'),
      "Valid API access token exists. plan_id does not exist in the system.",
      "The API should return HTTP 404 with an error indicating the plan was not found.",
      { endpoint: BASE.planProviderById("999999999"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_061",
      "Verify that an error is returned when plan_name exceeds 250 characters in the Edit Plan request body.",
      "Edit Plan API",
      "Boundary Validation",
      editSteps(`{"plan_name":"${str(251)}"}`),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 or 422 indicating plan_name exceeds 250 characters.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_062",
      "Verify that an error is returned when plan_code exceeds 100 characters in the Edit Plan request body.",
      "Edit Plan API",
      "Boundary Validation",
      editSteps(`{"plan_code":"${str(101)}"}`),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 or 422 indicating plan_code exceeds 100 characters.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_063",
      "Verify that an error is returned when type has an unsupported value in the Edit Plan request body.",
      "Edit Plan API",
      "Logical Validation",
      editSteps('{"type":99}'),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 or 422 indicating type must be 1 or 2.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_064",
      "Verify that an error is returned when plan_type has an unsupported value in the Edit Plan request body.",
      "Edit Plan API",
      "Logical Validation",
      editSteps('{"plan_type":99}'),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 or 422 indicating plan_type must be 1, 2, or 3.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_065",
      "Verify that an error is returned when billing_type has an unsupported value in the Edit Plan request body.",
      "Edit Plan API",
      "Logical Validation",
      editSteps('{"billing_type":5}'),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 or 422 indicating billing_type must be 1 or 2.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_066",
      "Verify that an error is returned when description exceeds 255 characters in the Edit Plan request body.",
      "Edit Plan API",
      "Boundary Validation",
      editSteps(`{"description":"${str(256)}"}`),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 or 422 indicating description exceeds 255 characters.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_067",
      "Verify that an error is returned when the Edit Plan API is called without Authorization header.",
      "Edit Plan API",
      "Authentication",
      stepsDefault("PATCH", editUrl, "no Authorization", '{"plan_name":"X"}', false),
      "Existing plan_id.",
      "The API should return HTTP 401 Unauthorized.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  push(
    tc(
      "API_TC_068",
      "Verify that an error is returned when the Edit Plan API is invoked with POST instead of PATCH.",
      "Edit Plan API",
      "HTTP Method Validation",
      stepsDefault("POST", BASE.planProviderById("<plan_id>"), authNote, '{"plan_name":"X"}'),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 405 Method Not Allowed or 404; update must not apply via incorrect method.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "POST" }
    )
  );

  push(
    tc(
      "API_TC_069",
      "Verify that an error is returned when the Edit Plan request body is malformed JSON.",
      "Edit Plan API",
      "Malformed JSON",
      stepsDefault("PATCH", editUrl, authNote, "invalid JSON"),
      "Valid API access token exists. Existing plan_id.",
      "The API should return HTTP 400 indicating malformed JSON.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "PATCH" }
    )
  );

  // ---------- Delete ----------
  const delUrl = BASE.planProviderById("{plan_id}");
  push(
    tc(
      "API_TC_070",
      "Verify that the Delete Plan API removes the plan when a valid plan_id and token are provided.",
      "Delete Plan API",
      "Success Response",
      stepsDefault("DELETE", delUrl, authNote, "no body"),
      "Valid API access token exists. A deletable plan_id exists in the test environment.",
      "The API should return HTTP 204 No Content or 200 with a success payload per API contract. Subsequent GET detail for the same id should return 404.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "DELETE" }
    )
  );

  push(
    tc(
      "API_TC_071",
      "Verify that an error is returned when deleting a non-existent plan_id.",
      "Delete Plan API",
      "Logical Validation",
      stepsDefault("DELETE", BASE.planProviderById("999999999"), authNote, "no body"),
      "Valid API access token exists.",
      "The API should return HTTP 404 with an error indicating the plan was not found.",
      { endpoint: BASE.planProviderById("999999999"), method: "DELETE" }
    )
  );

  push(
    tc(
      "API_TC_072",
      "Verify that an error is returned when the Delete Plan API is called without Authorization header.",
      "Delete Plan API",
      "Authentication",
      stepsDefault("DELETE", delUrl, "no Authorization", "no body", false),
      "Existing plan_id.",
      "The API should return HTTP 401 Unauthorized.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "DELETE" }
    )
  );

  push(
    tc(
      "API_TC_073",
      "Verify that an error is returned when the Delete Plan API is invoked with GET instead of DELETE.",
      "Delete Plan API",
      "HTTP Method Validation",
      stepsDefault("GET", BASE.planProviderById("<plan_id>"), authNote, "no body"),
      "Valid API access token exists.",
      "The API should return HTTP 405 Method Not Allowed or 200 for detail view if GET is defined for same path; must not delete the resource.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "GET" }
    )
  );

  // ---------- Detailed view GET (inferred URL; collection export had no URL) ----------
  const detailUrl = BASE.planProviderById("{plan_id}");
  push(
    tc(
      "API_TC_074",
      "Verify that the Plan Detailed View API returns plan details for a valid plan_id (GET by id).",
      "Plan Detailed View API",
      "Success Response",
      stepsDefault("GET", detailUrl, authNote, "no body"),
      "Valid API access token exists. plan_id exists. Note: Postman export named 'Detailed view' had no URL; endpoint assumed as GET /api/v1/plan/provider/{plan_id} consistent with Edit/Delete.",
      "The API should return HTTP 200 with Content-Type application/json. The body should include plan fields (provider, plan_name, plan_code, type, plan_type, billing_type, description) with correct types.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_075",
      "Verify that an error is returned when requesting details for a non-existent plan_id.",
      "Plan Detailed View API",
      "Logical Validation",
      stepsDefault("GET", BASE.planProviderById("999999999"), authNote, "no body"),
      "Valid API access token exists.",
      "The API should return HTTP 404 with an error indicating the plan was not found.",
      { endpoint: BASE.planProviderById("999999999"), method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_076",
      "Verify that an error is returned when the Plan Detailed View API is called without Authorization header.",
      "Plan Detailed View API",
      "Authentication",
      stepsDefault("GET", detailUrl, "no Authorization", "no body", false),
      "plan_id exists.",
      "The API should return HTTP 401 Unauthorized.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "GET" }
    )
  );

  push(
    tc(
      "API_TC_077",
      "Verify that the Plan Detailed View API response schema matches the expected structure and data types.",
      "Plan Detailed View API",
      "Response Schema Validation",
      stepsDefault("GET", detailUrl, authNote, "no body"),
      "Valid API access token exists. plan_id exists.",
      "The API should return HTTP 200. Response fields should match contract: string fields as strings, integer enums as numbers.",
      { endpoint: BASE.planProviderById("<plan_id>"), method: "GET" }
    )
  );

  return cases;
}

function caseToJsonRow(c) {
  return {
    slNo: c.slNo,
    testCaseId: c.testCaseId,
    testCaseDescription: c.testCaseDescription,
    feature: c.feature,
    subFeature: c.subFeature,
    testSteps: c.testSteps,
    preCondition: c.preCondition,
    expectedResult: c.expectedResult,
    status: c.status,
    automationHints: {
      endpoint: c.endpoint ?? null,
      method: c.method ?? null,
      samplePayload: c.samplePayload ?? undefined,
    },
  };
}

function writeExcel(rows, sheetTitle, filePath) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle.slice(0, 31));
  XLSX.writeFile(wb, filePath);
}

function main() {
  const cases = buildCases();
  const collectionMeta = {
    sourceCollection: "Automation - DXHub.postman_collection.json",
    generatedAt: new Date().toISOString(),
    outputDirectory: "test-cases/<api-slug>/",
    notes: [
      "Create/Edit field rules: provider int; plan_name max 250; plan_code max 100; type in {1,2}; plan_type in {1,2,3}; billing_type in {1,2}; description max 255.",
      "Login and Provider plan list use dxhub-dev-api host from collection; Plan CRUD uses dev-console-api.jpmob.jp from collection.",
      "Detailed View URL was missing in the Postman item; GET /api/v1/plan/provider/{id} assumed—confirm with backend if different.",
    ],
  };

  fs.mkdirSync(TEST_CASES_DIR, { recursive: true });

  let totalWritten = 0;
  const manifest = { meta: collectionMeta, apis: [] };

  for (const { feature, slug, sheetTitle } of API_GROUPS) {
    const subset = cases.filter((c) => c.feature === feature);
    if (subset.length === 0) {
      console.warn(`Warning: no test cases for feature "${feature}"`);
      continue;
    }

    const apiDir = path.join(TEST_CASES_DIR, slug);
    fs.mkdirSync(apiDir, { recursive: true });

    const renumbered = subset.map((c, i) => ({ ...c, slNo: i + 1 }));

    const jsonOut = {
      meta: {
        ...collectionMeta,
        api: feature,
        slug,
        testCaseCount: renumbered.length,
      },
      testCases: renumbered.map(caseToJsonRow),
    };

    const baseName = `${slug}-test-cases`;
    const jsonPath = path.join(apiDir, `${baseName}.json`);
    const xlsxPath = path.join(apiDir, `${baseName}.xlsx`);

    fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), "utf8");

    const rows = renumbered.map((c) => ({
      "Sl. No.": c.slNo,
      "Test Case ID": c.testCaseId,
      "Test Case Description": c.testCaseDescription,
      Feature: c.feature,
      "Sub Feature": c.subFeature,
      "Test Steps": c.testSteps,
      "PreCondition": c.preCondition,
      "Expected Result": c.expectedResult,
      Status: c.status,
    }));

    writeExcel(rows, sheetTitle, xlsxPath);

    totalWritten += renumbered.length;
    manifest.apis.push({
      feature,
      slug,
      testCaseCount: renumbered.length,
      json: path.relative(PROJECT_ROOT, jsonPath).replace(/\\/g, "/"),
      excel: path.relative(PROJECT_ROOT, xlsxPath).replace(/\\/g, "/"),
    });

    console.log(`Wrote: ${jsonPath} (${renumbered.length} cases)`);
    console.log(`Wrote: ${xlsxPath}`);
  }

  const manifestPath = path.join(TEST_CASES_DIR, "all-apis-manifest.json");
  manifest.meta.totalTestCases = cases.length;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log("Wrote:", manifestPath);
  console.log("Total test cases (all APIs):", cases.length);
  console.log("Per-API Sl. No. starts at 1 in each Excel/JSON file.");
}

main();
