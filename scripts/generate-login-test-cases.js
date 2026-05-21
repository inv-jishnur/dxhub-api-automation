/**
 * Generates Login API test cases (JSON + Excel) from API design spec (Login.md).
 * Run: node scripts/generate-login-test-cases.js
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const PROJECT_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'test-cases', 'login-api');
const ENDPOINT = '/api/v1/login';
const ENDPOINT_URL = '{AUTH_API_BASE_URL}/login';

function steps(method, bodyNote) {
  return [
    '1. Open API testing tool or automation environment.',
    `2. Enter API endpoint: ${ENDPOINT_URL}.`,
    `3. Select HTTP method: ${method}.`,
    '4. Set request headers: Content-Type: application/json; Accept: application/json (unless this test specifies otherwise).',
    '5. Do not send an Authorization header for Login requests.',
    bodyNote
      ? `6. Enter request payload: ${bodyNote}`
      : '6. Send the request without a body or as specified in this test case.',
    '7. Send the API request.',
    '8. Verify HTTP status code and response body against Expected Result.',
  ].join('\n');
}

function tc(id, description, subFeature, bodyNote, pre, expected, extra = {}) {
  return {
    testCaseId: id,
    testCaseDescription: description,
    feature: 'Login API',
    subFeature,
    testSteps: steps(extra.method ?? 'POST', bodyNote),
    preCondition: pre,
    expectedResult: expected,
    status: 'Not Executed',
    automationHints: {
      endpoint: ENDPOINT,
      method: extra.method ?? 'POST',
      samplePayload: extra.samplePayload,
    },
  };
}

function buildLoginCases() {
  const cases = [];

  cases.push(
    tc(
      'API_TC_001',
      'Verify that the Login API returns HTTP 200 with access token, refresh token, and user profile fields when valid email and password are provided.',
      'Success Response',
      '{"email":"<valid_email>","password":"<valid_password>"}',
      'A registered user account exists in the system with known email and password. API service is available.',
      'The API should return HTTP 200 with Content-Type application/json. The response body should include string fields "refresh" and "access", numeric "user_id", string "nick_name", string "email" matching the authenticated user, and numeric "role".',
      { samplePayload: { email: 'agent123@example.com', password: 'Agent@123' } }
    )
  );

  cases.push(
    tc(
      'API_TC_002',
      'Verify that an error response is returned when the email field is missing from the Login request body.',
      'Missing Parameter',
      '{"password":"<value>"}',
      'API service is available.',
      'The API should return HTTP 400 or 422 with an error indicating that email is required or the request is invalid.'
    )
  );

  cases.push(
    tc(
      'API_TC_003',
      'Verify that an error response is returned when the email field is null in the Login request body.',
      'Required Validation',
      '{"email":null,"password":"<value>"}',
      'API service is available.',
      'The API should return HTTP 400 or 422 with validation indicating email cannot be null or is invalid.'
    )
  );

  cases.push(
    tc(
      'API_TC_004',
      'Verify that an error response is returned when the email field is an empty string in the Login request body.',
      'Required Validation',
      '{"email":"","password":"<value>"}',
      'API service is available.',
      'The API should return HTTP 400 or 422 with an error indicating email is required or invalid.'
    )
  );

  cases.push(
    tc(
      'API_TC_005',
      'Verify that an error response is returned when the email field has an invalid data type in the Login request body.',
      'Data Type Validation',
      '{"email":12345,"password":"<value>"}',
      'API service is available.',
      'The API should return HTTP 400 or 422 indicating email is invalid or the request body failed validation.'
    )
  );

  cases.push(
    tc(
      'API_TC_006',
      'Verify that an error response is returned when the email field has an invalid email format in the Login request body.',
      'Format Validation',
      '{"email":"not-an-email","password":"<value>"}',
      'API service is available.',
      'The API should return HTTP 400 or 422 with an error indicating email format is invalid.'
    )
  );

  cases.push(
    tc(
      'API_TC_007',
      'Verify that an error response is returned when the email does not exist in the system.',
      'Invalid Credentials',
      '{"email":"<non_existent_email>","password":"<any_password>"}',
      'API service is available. Email is not registered in the system.',
      'The API should return HTTP 401 with errorCode "100" and message "Invalid credentials" per API specification. No access or refresh token should be returned.'
    )
  );

  cases.push(
    tc(
      'API_TC_008',
      'Verify that an error response is returned when the password field is missing from the Login request body.',
      'Missing Parameter',
      '{"email":"<valid_email>"}',
      'API service is available.',
      'The API should return HTTP 400 or 422 indicating password is required.'
    )
  );

  cases.push(
    tc(
      'API_TC_009',
      'Verify that an error response is returned when the password field is null in the Login request body.',
      'Required Validation',
      '{"email":"<valid_email>","password":null}',
      'API service is available.',
      'The API should return HTTP 400 or 422 with validation error for password.'
    )
  );

  cases.push(
    tc(
      'API_TC_010',
      'Verify that an error response is returned when the password field is an empty string in the Login request body.',
      'Required Validation',
      '{"email":"<valid_email>","password":""}',
      'API service is available.',
      'The API should return HTTP 400 or 422 indicating password is required or invalid.'
    )
  );

  cases.push(
    tc(
      'API_TC_011',
      'Verify that an error response is returned when the password field has an invalid data type in the Login request body.',
      'Data Type Validation',
      '{"email":"<valid_email>","password":12345}',
      'API service is available.',
      'The API should return HTTP 400 or 422 indicating password is invalid or failed validation.'
    )
  );

  cases.push(
    tc(
      'API_TC_012',
      'Verify that HTTP 401 with errorCode 100 and message Invalid credentials is returned when the password does not match the registered password.',
      'Invalid Credentials',
      '{"email":"<valid_email>","password":"<wrong_password>"}',
      'API service is available. Valid user exists; password is intentionally incorrect.',
      'The API should return HTTP 401. The response body should contain errorCode "100" and message "Invalid credentials". No access or refresh token should be issued.'
    )
  );

  cases.push(
    tc(
      'API_TC_013',
      'Verify that an error response is returned when the Login request body is empty.',
      'Request Validation',
      '(empty body)',
      'API service is available.',
      'The API should return HTTP 400 or 422 indicating the request body is missing or invalid.'
    )
  );

  cases.push(
    tc(
      'API_TC_014',
      'Verify that an error response is returned when the Login request body is malformed JSON.',
      'Malformed JSON',
      '{invalid json',
      'API service is available.',
      'The API should return HTTP 400 with an error indicating malformed JSON or invalid request body.'
    )
  );

  cases.push(
    tc(
      'API_TC_015',
      'Verify that the Login API handles unexpected fields in the request body without breaking server behavior.',
      'Unexpected Fields',
      '{"email":"<valid_email>","password":"<valid_password>","unexpected_field":"value"}',
      'API service is available.',
      'The API should either return HTTP 200 (ignoring unknown fields) or HTTP 400 if unknown fields are rejected. Response must match documented success or error contract.'
    )
  );

  cases.push(
    tc(
      'API_TC_016',
      'Verify that an error response is returned when the Login API is invoked with HTTP GET instead of POST.',
      'HTTP Method Validation',
      'none',
      'API service is available.',
      'The API should return HTTP 405 Method Not Allowed or HTTP 404, and must not perform login.',
      { method: 'GET' }
    )
  );

  cases.push(
    tc(
      'API_TC_017',
      'Verify that an error response is returned when the Login API is invoked with HTTP PUT instead of POST.',
      'HTTP Method Validation',
      '{"email":"<valid_email>","password":"<valid_password>"}',
      'API service is available.',
      'The API should return HTTP 405 Method Not Allowed or HTTP 404, and must not perform login.',
      { method: 'PUT' }
    )
  );

  cases.push(
    tc(
      'API_TC_018',
      'Verify that an error response is returned when the Login API is invoked with HTTP DELETE instead of POST.',
      'HTTP Method Validation',
      'none',
      'API service is available.',
      'The API should return HTTP 405 Method Not Allowed or HTTP 404, and must not perform login.',
      { method: 'DELETE' }
    )
  );

  cases.push(
    tc(
      'API_TC_019',
      'Verify that an error response is returned when Content-Type is not application/json for the Login API.',
      'Header Validation',
      'Valid JSON body with Content-Type: text/plain',
      'API service is available.',
      'The API should return HTTP 415 Unsupported Media Type or HTTP 400 indicating unsupported content type.'
    )
  );

  cases.push(
    tc(
      'API_TC_020',
      'Verify that an error response is returned when the Content-Type header is missing for the Login API.',
      'Header Validation',
      'Valid JSON body without Content-Type header',
      'API service is available.',
      'The API should return HTTP 400 or 415, or process the request per server configuration; login must not succeed with invalid content negotiation if JSON is required.'
    )
  );

  cases.push(
    tc(
      'API_TC_021',
      'Verify that HTTP 429 with errorCode 104 is returned when the account is temporarily locked after repeated failed login attempts.',
      'Account Lockout',
      'Repeated failed login attempts until lockout threshold',
      'Test account configured or driven to lockout state. API service is available.',
      'The API should return HTTP 429. The response body should contain errorCode "104" and message "Account is temporarily locked. Try again in 1 hour".',
      { automatable: false }
    )
  );

  return cases.map((c, i) => ({ slNo: i + 1, ...c }));
}

function main() {
  const testCases = buildLoginCases();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const doc = {
    meta: {
      source: 'd:\\Test File\\Login.md',
      generatedAt: new Date().toISOString(),
      api: 'Login API',
      slug: 'login-api',
      endpoint: ENDPOINT,
      method: 'POST',
      testCaseCount: testCases.length,
      notes: [
        'Pattern 1 request headers: Content-Type application/json, Accept application/json.',
        'Success 200: refresh, access, user_id, nick_name, email, role.',
        'Error 401: errorCode 100, message Invalid credentials.',
        'Error 429: errorCode 104, account lock — manual / environment setup (API_TC_021).',
      ],
    },
    testCases: testCases.map((c) => ({
      slNo: c.slNo,
      testCaseId: c.testCaseId,
      testCaseDescription: c.testCaseDescription,
      feature: c.feature,
      subFeature: c.subFeature,
      testSteps: c.testSteps,
      preCondition: c.preCondition,
      expectedResult: c.expectedResult,
      status: c.status,
      automationHints: c.automationHints,
      automatable: c.automatable !== false,
    })),
  };

  const baseName = 'login-api-test-cases';
  const jsonPath = path.join(OUT_DIR, `${baseName}.json`);
  const xlsxPath = path.join(OUT_DIR, `${baseName}.xlsx`);

  fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2), 'utf8');

  const rows = testCases.map((c) => ({
    'Sl. No.': c.slNo,
    'Test Case ID': c.testCaseId,
    'Test Case Description': c.testCaseDescription,
    Feature: c.feature,
    'Sub Feature': c.subFeature,
    'Test Steps': c.testSteps,
    PreCondition: c.preCondition,
    'Expected Result': c.expectedResult,
    Status: c.status,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Login API Tests');
  XLSX.writeFile(wb, xlsxPath);

  console.log(`Wrote ${jsonPath} (${testCases.length} cases)`);
  console.log(`Wrote ${xlsxPath}`);
}

main();
