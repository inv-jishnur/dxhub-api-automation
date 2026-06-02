# Create Discount API — Test Cases

## Document info

| Field | Value |
|-------|-------|
| API | Create Discount API |
| Feature | Discount Management — 33.1 Create discount |
| Method | POST |
| Endpoint | `/api/v1/discount` |
| Auth | Pattern 2 — `Authorization: DXHUB <access_token>` |
| Headers | `Content-Type: application/json`, `Accept: application/json` |
| Source | `d:\Test File\DiscountCreate.md` |
| Test case count | 51 |

### Valid reference payload

```json
{
  "code": "SIM50",
  "name": "Sim Welcome Discount",
  "service_id": 1,
  "coupon_type": 1,
  "discount_mode": 1,
  "value": 10,
  "status": 1,
  "start_date": "2026-04-01",
  "end_date": "2026-04-01"
}
```

### Field rules (from design)

| Field | Type | Required | Allowed values / notes |
|-------|------|----------|------------------------|
| code | String | yes | Coupon code |
| name | String | yes | Coupon name |
| service_id | Integer | yes | Service the discount applies to |
| discount_mode | Integer | yes | 1 = Fixed Amount, 2 = Percentage |
| coupon_type | Integer | yes | 1 = Initial, 2 = Monthly |
| value | Integer | yes | Discount value |
| start_date | Date | yes | Start date (`YYYY-MM-DD`) |
| end_date | Date | yes | End date (`YYYY-MM-DD`) |
| status | Integer | yes | 1 = Enabled, 2 = Disabled |

### Success response (documented)

HTTP **201** — `{ "message": "Discount created successfully", "code": "<request code>" }`

### Error response (documented)

HTTP **400** — field-level validation errors per general error response pattern.

---

## Test cases

### API_TC_001 — Valid payload success

- **Description:** Verify that the Create Discount API returns HTTP 201 when all required fields are valid according to the schema.
- **Feature:** Create Discount API
- **Sub Feature:** Success Response
- **PreCondition:** Valid API access token exists. Service ID 1 (or a valid service from the environment) exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount`.
  2. Set headers: `Authorization: DXHUB <valid_token>`, `Content-Type: application/json`, `Accept: application/json`.
  3. Send request body with all required fields using the valid reference payload.
  4. Verify HTTP status and response body.
- **Expected Result:** The API should return HTTP 201 with Content-Type application/json. The response body should contain `message` equal to `"Discount created successfully"` and `code` matching the request `code` field.
- **Status:** Not Executed

---

### API_TC_002 — code missing

- **Description:** Verify that an error is returned when code is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `code`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that code is required.
- **Status:** Not Executed

---

### API_TC_003 — code null

- **Description:** Verify that an error is returned when code is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"code": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that code is invalid or required.
- **Status:** Not Executed

---

### API_TC_004 — code empty

- **Description:** Verify that an error is returned when code is empty in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"code": ""` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that code is invalid or required.
- **Status:** Not Executed

---

### API_TC_005 — code invalid data type

- **Description:** Verify that an error is returned when code has an invalid data type (number) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"code": 12345` (number) and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that code must be a string.
- **Status:** Not Executed

---

### API_TC_006 — name missing

- **Description:** Verify that an error is returned when name is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `name`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that name is required.
- **Status:** Not Executed

---

### API_TC_007 — name null

- **Description:** Verify that an error is returned when name is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"name": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that name is invalid or required.
- **Status:** Not Executed

---

### API_TC_008 — name empty

- **Description:** Verify that an error is returned when name is empty in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"name": ""` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that name is invalid or required.
- **Status:** Not Executed

---

### API_TC_009 — name invalid data type

- **Description:** Verify that an error is returned when name has an invalid data type (boolean) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"name": true` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that name must be a string.
- **Status:** Not Executed

---

### API_TC_010 — service_id missing

- **Description:** Verify that an error is returned when service_id is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `service_id`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that service_id is required.
- **Status:** Not Executed

---

### API_TC_011 — service_id null

- **Description:** Verify that an error is returned when service_id is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"service_id": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that service_id is invalid or required.
- **Status:** Not Executed

---

### API_TC_012 — service_id invalid data type

- **Description:** Verify that an error is returned when service_id has an invalid data type (string) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"service_id": "1"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that service_id must be an integer.
- **Status:** Not Executed

---

### API_TC_013 — service_id non-existent

- **Description:** Verify that an error is returned when service_id references a non-existent service in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists. Service ID `999999999` does not exist.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"service_id": 999999999` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 or 404 with an error indicating the service is not found or invalid.
- **Status:** Not Executed

---

### API_TC_014 — discount_mode missing

- **Description:** Verify that an error is returned when discount_mode is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `discount_mode`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that discount_mode is required.
- **Status:** Not Executed

---

### API_TC_015 — discount_mode null

- **Description:** Verify that an error is returned when discount_mode is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"discount_mode": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that discount_mode is invalid or required.
- **Status:** Not Executed

---

### API_TC_016 — discount_mode unsupported value

- **Description:** Verify that an error is returned when discount_mode has an unsupported integer value (not 1 or 2) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"discount_mode": 5` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating discount_mode must be 1 (Fixed Amount) or 2 (Percentage).
- **Status:** Not Executed

---

### API_TC_017 — discount_mode invalid data type

- **Description:** Verify that an error is returned when discount_mode has an invalid data type (string) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"discount_mode": "1"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that discount_mode must be an integer.
- **Status:** Not Executed

---

### API_TC_018 — discount_mode Fixed Amount

- **Description:** Verify that the Create Discount API accepts discount_mode value 1 (Fixed Amount).
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body with `"discount_mode": 1` and a unique `code`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 201 and persist discount_mode as Fixed Amount (1).
- **Status:** Not Executed

---

### API_TC_019 — discount_mode Percentage

- **Description:** Verify that the Create Discount API accepts discount_mode value 2 (Percentage).
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body with `"discount_mode": 2` and a unique `code`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 201 and persist discount_mode as Percentage (2).
- **Status:** Not Executed

---

### API_TC_020 — coupon_type missing

- **Description:** Verify that an error is returned when coupon_type is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `coupon_type`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that coupon_type is required.
- **Status:** Not Executed

---

### API_TC_021 — coupon_type null

- **Description:** Verify that an error is returned when coupon_type is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"coupon_type": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that coupon_type is invalid or required.
- **Status:** Not Executed

---

### API_TC_022 — coupon_type unsupported value

- **Description:** Verify that an error is returned when coupon_type has an unsupported integer value (not 1 or 2) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"coupon_type": 5` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating coupon_type must be 1 (Initial) or 2 (Monthly).
- **Status:** Not Executed

---

### API_TC_023 — coupon_type invalid data type

- **Description:** Verify that an error is returned when coupon_type has an invalid data type (string) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"coupon_type": "1"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that coupon_type must be an integer.
- **Status:** Not Executed

---

### API_TC_024 — coupon_type Initial

- **Description:** Verify that the Create Discount API accepts coupon_type value 1 (Initial).
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body with `"coupon_type": 1` and a unique `code`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 201 and persist coupon_type as Initial (1).
- **Status:** Not Executed

---

### API_TC_025 — coupon_type Monthly

- **Description:** Verify that the Create Discount API accepts coupon_type value 2 (Monthly).
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body with `"coupon_type": 2` and a unique `code`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 201 and persist coupon_type as Monthly (2).
- **Status:** Not Executed

---

### API_TC_026 — value missing

- **Description:** Verify that an error is returned when value is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `value`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that value is required.
- **Status:** Not Executed

---

### API_TC_027 — value null

- **Description:** Verify that an error is returned when value is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"value": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that value is invalid or required.
- **Status:** Not Executed

---

### API_TC_028 — value invalid data type

- **Description:** Verify that an error is returned when value has an invalid data type (string) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"value": "10"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that value must be an integer.
- **Status:** Not Executed

---

### API_TC_029 — value negative

- **Description:** Verify that an error is returned when value is negative in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"value": -1` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that value must be a positive integer.
- **Status:** Not Executed

---

### API_TC_030 — value zero

- **Description:** Verify that an error is returned when value is zero in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"value": 0` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that value must be greater than zero.
- **Status:** Not Executed

---

### API_TC_031 — start_date missing

- **Description:** Verify that an error is returned when start_date is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `start_date`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that start_date is required.
- **Status:** Not Executed

---

### API_TC_032 — start_date null

- **Description:** Verify that an error is returned when start_date is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"start_date": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that start_date is invalid or required.
- **Status:** Not Executed

---

### API_TC_033 — start_date invalid format

- **Description:** Verify that an error is returned when start_date has an invalid date format in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Format Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"start_date": "2026/04/01"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that start_date format is invalid (expected `YYYY-MM-DD`).
- **Status:** Not Executed

---

### API_TC_034 — start_date invalid data type

- **Description:** Verify that an error is returned when start_date has an invalid data type (number) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"start_date": 20260401` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that start_date must be a valid date string.
- **Status:** Not Executed

---

### API_TC_035 — end_date missing

- **Description:** Verify that an error is returned when end_date is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `end_date`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that end_date is required.
- **Status:** Not Executed

---

### API_TC_036 — end_date null

- **Description:** Verify that an error is returned when end_date is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"end_date": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that end_date is invalid or required.
- **Status:** Not Executed

---

### API_TC_037 — end_date invalid format

- **Description:** Verify that an error is returned when end_date has an invalid date format in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Format Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"end_date": "2026/04/01"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that end_date format is invalid (expected `YYYY-MM-DD`).
- **Status:** Not Executed

---

### API_TC_038 — end_date before start_date

- **Description:** Verify that an error is returned when end_date is earlier than start_date in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"start_date": "2026-06-01"` and `"end_date": "2026-05-01"`; all other fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that end_date must not be earlier than start_date.
- **Status:** Not Executed

---

### API_TC_039 — status missing

- **Description:** Verify that an error is returned when status is missing from the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Missing Parameter
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body omitting `status`; include all other required fields.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating that status is required.
- **Status:** Not Executed

---

### API_TC_040 — status null

- **Description:** Verify that an error is returned when status is null in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Required Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"status": null` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that status is invalid or required.
- **Status:** Not Executed

---

### API_TC_041 — status unsupported value

- **Description:** Verify that an error is returned when status has an unsupported integer value (not 1 or 2) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"status": 5` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating status must be 1 (Enabled) or 2 (Disabled).
- **Status:** Not Executed

---

### API_TC_042 — status invalid data type

- **Description:** Verify that an error is returned when status has an invalid data type (string) in the Create Discount request body.
- **Feature:** Create Discount API
- **Sub Feature:** Data Type Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send body with `"status": "1"` and all other required fields valid.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating that status must be an integer.
- **Status:** Not Executed

---

### API_TC_043 — status Enabled

- **Description:** Verify that the Create Discount API accepts status value 1 (Enabled).
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body with `"status": 1` and a unique `code`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 201 and persist status as Enabled (1).
- **Status:** Not Executed

---

### API_TC_044 — status Disabled

- **Description:** Verify that the Create Discount API accepts status value 2 (Disabled).
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body with `"status": 2` and a unique `code`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 201 and persist status as Disabled (2).
- **Status:** Not Executed

---

### API_TC_045 — duplicate code

- **Description:** Verify that an error is returned when the Create Discount request contains a duplicate code that already exists.
- **Feature:** Create Discount API
- **Sub Feature:** Logical Validation
- **PreCondition:** Valid API access token exists. A discount with the same `code` already exists in the system.
- **Test Steps:**
  1. Create a discount with a known `code` (or use an existing one).
  2. Send `POST /api/v1/discount` with the same `code` and otherwise valid payload.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error indicating the discount code already exists.
- **Status:** Not Executed

---

### API_TC_046 — unexpected extra field

- **Description:** Verify that an error is returned when the Create Discount request contains unexpected extra fields not defined in the contract.
- **Feature:** Create Discount API
- **Sub Feature:** Request Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send valid body plus `"unexpected_field_xyz": true`.
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 with an error about unexpected fields, or HTTP 201 if extra fields are ignored; result must match product specification.
- **Status:** Not Executed

---

### API_TC_047 — malformed JSON

- **Description:** Verify that an error is returned when the Create Discount request body is malformed JSON.
- **Feature:** Create Discount API
- **Sub Feature:** Malformed JSON
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid auth headers.
  2. Send raw body `{` (invalid JSON).
  3. Verify response.
- **Expected Result:** The API should return HTTP 400 indicating malformed JSON.
- **Status:** Not Executed

---

### API_TC_048 — missing Authorization header

- **Description:** Verify that an error is returned when the Create Discount API is called without Authorization header.
- **Feature:** Create Discount API
- **Sub Feature:** Authentication
- **PreCondition:** API service is available.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount`.
  2. Set `Content-Type: application/json` only; omit Authorization.
  3. Send valid JSON body.
  4. Verify response.
- **Expected Result:** The API should return HTTP 401 Unauthorized.
- **Status:** Not Executed

---

### API_TC_049 — invalid access token

- **Description:** Verify that an error is returned when the Create Discount API is called with an invalid access token.
- **Feature:** Create Discount API
- **Sub Feature:** Invalid Token
- **PreCondition:** API service is available.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount`.
  2. Set `Authorization: DXHUB invalid_token_string` and JSON headers.
  3. Send valid JSON body.
  4. Verify response.
- **Expected Result:** The API should return HTTP 401 Unauthorized.
- **Status:** Not Executed

---

### API_TC_050 — invalid Content-Type

- **Description:** Verify that an error is returned when Content-Type is not application/json for the Create Discount API.
- **Feature:** Create Discount API
- **Sub Feature:** Header Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Set endpoint `POST /api/v1/discount` with valid Authorization.
  2. Set `Content-Type: text/plain` (not `application/json`).
  3. Send JSON string as body.
  4. Verify response.
- **Expected Result:** The API should return HTTP 415 Unsupported Media Type or HTTP 400 as per implementation.
- **Status:** Not Executed

---

### API_TC_051 — GET method rejected

- **Description:** Verify that the Create Discount API rejects GET method on the create endpoint URL.
- **Feature:** Create Discount API
- **Sub Feature:** HTTP Method Validation
- **PreCondition:** Valid API access token exists.
- **Test Steps:**
  1. Send `GET /api/v1/discount` with valid auth headers and no body.
  2. Verify response.
- **Expected Result:** The API should return HTTP 405 Method Not Allowed or HTTP 404.
- **Status:** Not Executed
