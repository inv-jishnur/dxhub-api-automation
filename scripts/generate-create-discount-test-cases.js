/**
 * Generates test-cases/create-discount-api/create-discount-api-test-cases.json
 * and Excel export with standard QA columns.
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'test-cases', 'create-discount-api');
const BASE_ENDPOINT = 'https://dev-console-api.jpmob.jp/api/v1/discount';
const START_TC = 78;

const validPayload = {
  code: 'SIM50',
  name: 'Sim Welcome Discount',
  service_id: 1,
  coupon_type: 1,
  discount_mode: 1,
  value: 10,
  status: 1,
  start_date: '2026-04-01',
  end_date: '2026-04-01',
};

/** Build payload; omit keys whose value is `undefined` (missing-field tests). */
function body(overrides) {
  const merged = { ...validPayload, ...overrides };
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined));
}

function steps(payload) {
  const body = JSON.stringify(payload);
  return [
    '1. Open API testing tool or automation environment.',
    `2. Enter API endpoint: ${BASE_ENDPOINT}.`,
    '3. Select HTTP method: POST.',
    '4. Set request headers: Authorization: DXHUB <valid_token>; Content-Type: application/json; Accept: application/json.',
    '5. Provide authentication token as per test (DXHUB <access_token> in Authorization header when required).',
    `6. Enter request payload: ${body}`,
    '7. Send the API request.',
    '8. Verify HTTP status code and response body against Expected Result.',
  ].join('\n');
}

function tc(id, description, subFeature, payload, expected, pre = 'Valid API access token exists.') {
  const num = id.replace('API_TC_', '');
  return {
    slNo: Number(num) - START_TC + 1,
    testCaseId: id,
    testCaseDescription: description,
    feature: 'Create Discount API',
    subFeature,
    testSteps: steps(payload),
    preCondition: pre,
    expectedResult: expected,
    status: 'Not Executed',
    automationHints: {
      endpoint: BASE_ENDPOINT,
      method: 'POST',
      samplePayload: payload,
    },
  };
}

const cases = [
  tc(
    'API_TC_078',
    'Verify that the Create Discount API returns HTTP 201 when all required fields are valid according to the schema.',
    'Success Response',
    validPayload,
    'The API should return HTTP 201 with Content-Type application/json. The response body should contain message "Discount created successfully" and code matching the request code field.'
  ),
  tc(
    'API_TC_079',
    'Verify that an error is returned when code is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ code: undefined }),
    'The API should return HTTP 400 with an error indicating that code is required.'
  ),
  tc(
    'API_TC_080',
    'Verify that an error is returned when code is null in the Create Discount request body.',
    'Required Validation',
    body({ code: null }),
    'The API should return HTTP 400 indicating that code is invalid or required.'
  ),
  tc(
    'API_TC_081',
    'Verify that an error is returned when code is empty in the Create Discount request body.',
    'Required Validation',
    body({ code: '' }),
    'The API should return HTTP 400 indicating that code is required or invalid.'
  ),
  tc(
    'API_TC_082',
    'Verify that an error is returned when code has an invalid data type (number) in the Create Discount request body.',
    'Data Type Validation',
    body({ code: 12345 }),
    'The API should return HTTP 400 indicating that code must be a string.'
  ),
  tc(
    'API_TC_083',
    'Verify that an error is returned when name is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ name: undefined }),
    'The API should return HTTP 400 with an error indicating that name is required.'
  ),
  tc(
    'API_TC_084',
    'Verify that an error is returned when name is null in the Create Discount request body.',
    'Required Validation',
    body({ name: null }),
    'The API should return HTTP 400 indicating that name is invalid or required.'
  ),
  tc(
    'API_TC_085',
    'Verify that an error is returned when name is empty in the Create Discount request body.',
    'Required Validation',
    body({ name: '' }),
    'The API should return HTTP 400 indicating that name is required or invalid.'
  ),
  tc(
    'API_TC_086',
    'Verify that an error is returned when name has an invalid data type (boolean) in the Create Discount request body.',
    'Data Type Validation',
    body({ name: true }),
    'The API should return HTTP 400 indicating that name must be a string.'
  ),
  tc(
    'API_TC_087',
    'Verify that an error is returned when service_id is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ service_id: undefined }),
    'The API should return HTTP 400 with an error indicating that service_id is required.'
  ),
  tc(
    'API_TC_088',
    'Verify that an error is returned when service_id is null in the Create Discount request body.',
    'Required Validation',
    body({ service_id: null }),
    'The API should return HTTP 400 indicating that service_id is invalid or required.'
  ),
  tc(
    'API_TC_089',
    'Verify that an error is returned when service_id has an invalid data type (string) in the Create Discount request body.',
    'Data Type Validation',
    body({ service_id: '1' }),
    'The API should return HTTP 400 indicating that service_id must be an integer.'
  ),
  tc(
    'API_TC_090',
    'Verify that an error is returned when service_id references a non-existent service in the Create Discount request body.',
    'Logical Validation',
    body({ service_id: 999999999 }),
    'The API should return HTTP 400 or 404 with an error indicating the service is not found or invalid.',
    'Valid API access token exists. Service ID 999999999 does not exist.'
  ),
  tc(
    'API_TC_091',
    'Verify that an error is returned when discount_mode is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ discount_mode: undefined }),
    'The API should return HTTP 400 with an error indicating that discount_mode is required.'
  ),
  tc(
    'API_TC_092',
    'Verify that an error is returned when discount_mode is null in the Create Discount request body.',
    'Required Validation',
    body({ discount_mode: null }),
    'The API should return HTTP 400 indicating that discount_mode is invalid or required.'
  ),
  tc(
    'API_TC_093',
    'Verify that an error is returned when discount_mode has an unsupported integer value (not 1 or 2) in the Create Discount request body.',
    'Logical Validation',
    body({ discount_mode: 99 }),
    'The API should return HTTP 400 indicating that discount_mode is invalid or unsupported.'
  ),
  tc(
    'API_TC_094',
    'Verify that an error is returned when discount_mode has an invalid data type (string) in the Create Discount request body.',
    'Data Type Validation',
    body({ discount_mode: '1' }),
    'The API should return HTTP 400 indicating that discount_mode must be an integer.'
  ),
  tc(
    'API_TC_095',
    'Verify that the Create Discount API accepts discount_mode value 1 (Fixed Amount).',
    'Success Response',
    body({ discount_mode: 1 }),
    'The API should return HTTP 201 with a success message and the created discount code in the response body.'
  ),
  tc(
    'API_TC_096',
    'Verify that the Create Discount API accepts discount_mode value 2 (Percentage).',
    'Success Response',
    body({ discount_mode: 2 }),
    'The API should return HTTP 201 with a success message and the created discount code in the response body.'
  ),
  tc(
    'API_TC_097',
    'Verify that an error is returned when coupon_type is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ coupon_type: undefined }),
    'The API should return HTTP 400 with an error indicating that coupon_type is required.'
  ),
  tc(
    'API_TC_098',
    'Verify that an error is returned when coupon_type is null in the Create Discount request body.',
    'Required Validation',
    body({ coupon_type: null }),
    'The API should return HTTP 400 indicating that coupon_type is invalid or required.'
  ),
  tc(
    'API_TC_099',
    'Verify that an error is returned when coupon_type has an unsupported integer value (not 1 or 2) in the Create Discount request body.',
    'Logical Validation',
    body({ coupon_type: 10 }),
    'The API should return HTTP 400 indicating that coupon_type is invalid or unsupported.'
  ),
  tc(
    'API_TC_100',
    'Verify that an error is returned when coupon_type has an invalid data type (string) in the Create Discount request body.',
    'Data Type Validation',
    body({ coupon_type: '1' }),
    'The API should return HTTP 400 indicating that coupon_type must be an integer.'
  ),
  tc(
    'API_TC_101',
    'Verify that the Create Discount API accepts coupon_type value 1 (Initial).',
    'Success Response',
    body({ coupon_type: 1 }),
    'The API should return HTTP 201 with a success message and the created discount code in the response body.'
  ),
  tc(
    'API_TC_102',
    'Verify that the Create Discount API accepts coupon_type value 2 (Monthly).',
    'Success Response',
    body({ coupon_type: 2 }),
    'The API should return HTTP 201 with a success message and the created discount code in the response body.'
  ),
  tc(
    'API_TC_103',
    'Verify that an error is returned when value is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ value: undefined }),
    'The API should return HTTP 400 with an error indicating that value is required.'
  ),
  tc(
    'API_TC_104',
    'Verify that an error is returned when value is null in the Create Discount request body.',
    'Required Validation',
    body({ value: null }),
    'The API should return HTTP 400 indicating that value is invalid or required.'
  ),
  tc(
    'API_TC_105',
    'Verify that an error is returned when value has an invalid data type (string) in the Create Discount request body.',
    'Data Type Validation',
    body({ value: '10' }),
    'The API should return HTTP 400 indicating that value must be an integer.'
  ),
  tc(
    'API_TC_106',
    'Verify that an error is returned when value is negative in the Create Discount request body.',
    'Logical Validation',
    body({ value: -1 }),
    'The API should return HTTP 400 indicating that value is invalid.'
  ),
  tc(
    'API_TC_107',
    'Verify that an error is returned when value is zero in the Create Discount request body.',
    'Boundary Validation',
    body({ value: 0 }),
    'The API should return HTTP 400 indicating that value must be greater than zero.'
  ),
  tc(
    'API_TC_108',
    'Verify that an error is returned when start_date is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ start_date: undefined }),
    'The API should return HTTP 400 with an error indicating that start_date is required.'
  ),
  tc(
    'API_TC_109',
    'Verify that an error is returned when start_date is null in the Create Discount request body.',
    'Required Validation',
    body({ start_date: null }),
    'The API should return HTTP 400 indicating that start_date is invalid or required.'
  ),
  tc(
    'API_TC_110',
    'Verify that an error is returned when start_date has an invalid date format in the Create Discount request body.',
    'Format Validation',
    body({ start_date: '01-04-2026' }),
    'The API should return HTTP 400 indicating that start_date format is invalid.'
  ),
  tc(
    'API_TC_111',
    'Verify that an error is returned when start_date has an invalid data type (number) in the Create Discount request body.',
    'Data Type Validation',
    body({ start_date: 20260401 }),
    'The API should return HTTP 400 indicating that start_date must be a valid date string.'
  ),
  tc(
    'API_TC_112',
    'Verify that an error is returned when end_date is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ end_date: undefined }),
    'The API should return HTTP 400 with an error indicating that end_date is required.'
  ),
  tc(
    'API_TC_113',
    'Verify that an error is returned when end_date is null in the Create Discount request body.',
    'Required Validation',
    body({ end_date: null }),
    'The API should return HTTP 400 indicating that end_date is invalid or required.'
  ),
  tc(
    'API_TC_114',
    'Verify that an error is returned when end_date has an invalid date format in the Create Discount request body.',
    'Format Validation',
    body({ end_date: '2026/04/01' }),
    'The API should return HTTP 400 indicating that end_date format is invalid.'
  ),
  tc(
    'API_TC_115',
    'Verify that an error is returned when end_date is earlier than start_date in the Create Discount request body.',
    'Logical Validation',
    body({ start_date: '2026-06-01', end_date: '2026-05-01' }),
    'The API should return HTTP 400 indicating that end_date must be on or after start_date.'
  ),
  tc(
    'API_TC_116',
    'Verify that an error is returned when status is missing from the Create Discount request body.',
    'Missing Parameter',
    body({ status: undefined }),
    'The API should return HTTP 400 with an error indicating that status is required.'
  ),
  tc(
    'API_TC_117',
    'Verify that an error is returned when status is null in the Create Discount request body.',
    'Required Validation',
    body({ status: null }),
    'The API should return HTTP 400 indicating that status is invalid or required.'
  ),
  tc(
    'API_TC_118',
    'Verify that an error is returned when status has an unsupported integer value (not 1 or 2) in the Create Discount request body.',
    'Logical Validation',
    body({ status: 5 }),
    'The API should return HTTP 400 indicating that status is invalid or unsupported.'
  ),
  tc(
    'API_TC_119',
    'Verify that an error is returned when status has an invalid data type (string) in the Create Discount request body.',
    'Data Type Validation',
    body({ status: '1' }),
    'The API should return HTTP 400 indicating that status must be an integer.'
  ),
  tc(
    'API_TC_120',
    'Verify that the Create Discount API accepts status value 1 (Enabled).',
    'Success Response',
    body({ status: 1 }),
    'The API should return HTTP 201 with a success message and the created discount code in the response body.'
  ),
  tc(
    'API_TC_121',
    'Verify that the Create Discount API accepts status value 2 (Disabled).',
    'Success Response',
    body({ status: 2 }),
    'The API should return HTTP 201 with a success message and the created discount code in the response body.'
  ),
  tc(
    'API_TC_122',
    'Verify that an error is returned when the Create Discount request contains a duplicate code that already exists.',
    'Logical Validation',
    body({ code: 'DUPLICATE_CODE_TEST' }),
    'The API should return HTTP 400 indicating that the discount code already exists.',
    'Valid API access token exists. A discount with code DUPLICATE_CODE_TEST was created in a prior step.'
  ),
  tc(
    'API_TC_123',
    'Verify that an error is returned when the Create Discount request contains unexpected extra fields not defined in the contract.',
    'Request Validation',
    body({ unexpected_field_xyz: true }),
    'The API should return HTTP 400 rejecting unknown fields, or HTTP 201 if extra fields are ignored per backend policy.'
  ),
  tc(
    'API_TC_124',
    'Verify that an error is returned when the Create Discount request body is malformed JSON.',
    'Request Validation',
    '{',
    'The API should return HTTP 400 indicating the request body is not valid JSON.'
  ),
  tc(
    'API_TC_125',
    'Verify that an error is returned when the Create Discount API is called without Authorization header.',
    'Authorization Validation',
    validPayload,
    'The API should return HTTP 401 indicating authentication is required.'
  ),
  tc(
    'API_TC_126',
    'Verify that an error is returned when the Create Discount API is called with an invalid access token.',
    'Authorization Validation',
    validPayload,
    'The API should return HTTP 401 indicating the token is invalid or unauthorized.'
  ),
  tc(
    'API_TC_127',
    'Verify that an error is returned when Content-Type is not application/json for the Create Discount API.',
    'Header Validation',
    validPayload,
    'The API should return HTTP 400 or 415 indicating an unsupported or invalid Content-Type.'
  ),
  tc(
    'API_TC_128',
    'Verify that the Create Discount API rejects GET method on the create endpoint URL.',
    'HTTP Method Validation',
    validPayload,
    'The API should return HTTP 404 or 405 indicating GET is not allowed on this endpoint.'
  ),
];

const doc = {
  meta: {
    sourceDocument: 'DiscountCreate.md',
    generatedAt: new Date().toISOString(),
    outputDirectory: 'test-cases/create-discount-api/',
    notes: [
      'POST /api/v1/discount — Pattern 2 auth (DXHUB token).',
      'discount_mode: 1 Fixed Amount, 2 Percentage; coupon_type: 1 Initial, 2 Monthly; status: 1 Enabled, 2 Disabled.',
      'Success: HTTP 201 with message and code in response.',
    ],
    api: 'Create Discount API',
    slug: 'create-discount-api',
    testCaseCount: cases.length,
  },
  testCases: cases,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = path.join(OUT_DIR, 'create-discount-api-test-cases.json');
fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2), 'utf8');
console.log('Wrote', jsonPath, `(${cases.length} cases)`);

const header = [
  'Sl. No.',
  'Test Case ID',
  'Test Case Description',
  'Feature',
  'Sub Feature',
  'Test Steps',
  'PreCondition',
  'Expected Result',
  'Status',
];
const rows = [header];
for (const c of doc.testCases) {
  rows.push([
    c.slNo,
    c.testCaseId,
    c.testCaseDescription,
    c.feature,
    c.subFeature,
    c.testSteps,
    c.preCondition,
    c.expectedResult,
    c.status,
  ]);
}
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);
XLSX.utils.book_append_sheet(wb, ws, 'Create Discount API');
const xlsxPath = path.join(OUT_DIR, 'create-discount-api-test-cases.xlsx');
XLSX.writeFile(wb, xlsxPath);
console.log('Wrote', xlsxPath);
