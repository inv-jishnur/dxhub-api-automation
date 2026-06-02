# DXHUB API Requirements Document

**Project:** DXHUB API Automation  
**Document:** API Requirements — DXhub  
**Version:** 1.0  
**Last updated:** 2026-05-22  
**Scope:** All APIs currently automated in this project (7 APIs, 128 test cases)

---

## 1. Document purpose

This document defines the functional requirements, endpoints, request/response contracts, validation rules, and expected HTTP behaviour for DXHUB Console and Auth APIs used in manual and automated testing.

**Sources consolidated:**

- `d:\Test File\Login.md`
- Postman collection: `Automation - DXHub.postman_collection.json`
- Test case JSON under `test-cases/`
- Automation specs under `tests/api/`

---

## 2. Environment and authentication

### 2.1 Base URLs

| Service | Env variable | Default / example | APIs |
|---------|--------------|-------------------|------|
| Auth API | `AUTH_API_BASE_URL` | `https://dxhub-dev-api.innovaturelabs.net/api/v1` | Login, Provider Plan List |
| Console API | `BASE_URL` | `https://dev-console-api.jpmob.jp/api/v1` (from `.env`) | Plan CRUD, Discount |

### 2.2 Authentication patterns

| Pattern | Used for | Request header |
|---------|----------|----------------|
| **Pattern 1 — No auth** | Login only | `Content-Type: application/json`, `Accept: application/json` |
| **Pattern 2 — DXHUB token** | All protected APIs | `Authorization: DXHUB <access_token>`, `Content-Type: application/json`, `Accept: application/json` |

**Token acquisition:** Call Login API → use `access` field from response as `<access_token>`.

**Env overrides:** `AUTH_PREFIX` (default `DXHUB`), `ACCESS_TOKEN` (skip login in CI when preset).

### 2.3 Shared test configuration (`.env` / `data.yaml`)

| Variable | Purpose |
|----------|---------|
| `VALID_EMAIL`, `VALID_PASSWORD` | Login success |
| `INVALID_EMAIL`, `INVALID_PASSWORD` | Login negative tests |
| `PROVIDER_ID` | Valid provider for Plan APIs (default `9`) |
| `SERVICE_ID` | Valid service for Discount API (default `1`) |

---

## 3. API catalogue

| # | API | Method | URI | Auth | Test cases |
|---|-----|--------|-----|------|------------|
| 1 | Login | POST | `/login` | No | API_TC_001 – API_TC_021 |
| 2 | Provider Plan List | GET | `/plan/providers` | Yes | API_TC_011 – API_TC_016 |
| 3 | Create Plan | POST | `/plan/provider` | Yes | API_TC_017 – API_TC_057 |
| 4 | Edit Plan | PATCH | `/plan/provider/{plan_id}` | Yes | API_TC_058 – API_TC_069 |
| 5 | Delete Plan | DELETE | `/plan/provider/{plan_id}` | Yes | API_TC_070 – API_TC_073 |
| 6 | Plan Detailed View | GET | `/plan/provider/{plan_id}` | Yes | API_TC_074 – API_TC_077 |
| 7 | Create Discount | POST | `/discount` | Yes | API_TC_078 – API_TC_128 |

---

## 4. API specifications

---

### 4.1 Admin — Authentication

#### 4.1.1 Login

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{AUTH_API_BASE_URL}/login` (e.g. `/api/v1/login`)                          |
+------------------+---------------------------------------------------------------------------+
| Method           | POST                                                                      |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Authenticate user and obtain access token and refresh token               |
+------------------+---------------------------------------------------------------------------+
| Request                                                                                      |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 1: `Content-Type: application/json`, `Accept: application/json`   |
|                  | (No Authorization header)                                                 |
+------------------+------------------+------------------+------------------+------------------+
| Input Parameters | Field            | Type             | Required         | Description      |
|                  +------------------+------------------+------------------+------------------+
|                  | email            | String           | Yes              | Registered user  |
|                  |                  |                  |                  | email            |
|                  +------------------+------------------+------------------+------------------+
|                  | password         | String           | Yes              | User password    |
+------------------+------------------+------------------+------------------+------------------+
| Sample request   | {                                                                         |
| body             |   "email": "agent123@example.com",                                        |
|                  |   "password": "Agent@123"                                                 |
|                  | }                                                                         |
+------------------+---------------------------------------------------------------------------+
| Response                                                                                     |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 200                                                                  |
|                  | {                                                                         |
|                  |   "refresh": "<jwt>",                                                     |
|                  |   "access": "<jwt>",                                                      |
|                  |   "user_id": 1,                                                           |
|                  |   "nick_name": "nickname",                                                |
|                  |   "email": "user@example.com",                                            |
|                  |   "role": 0                                                               |
|                  | }                                                                         |
+------------------+---------------------------------------------------------------------------+
| Error Response   | **Case 1 — Invalid credentials**                                          |
|                  | HTTP 401                                                                  |
|                  | { "errorCode": "100", "message": "Invalid credentials" }                  |
|                  |                                                                           |
|                  | **Case 2 — Account locked**                                               |
|                  | HTTP 429                                                                  |
|                  | { "errorCode": "104", "message": "Account is temporarily locked..." }   |
|                  |                                                                           |
|                  | **Validation errors**                                                     |
|                  | HTTP 400 / 422 — missing/null/invalid email or password                   |
+------------------+---------------------------------------------------------------------------+

**Validation rules:** email required, valid format; password required; wrong method (GET/PUT/DELETE) → 401/404/405; malformed JSON → 400/500.

---

### 4.2 Provider — Plan list

#### 4.2.1 Provider Plan List

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{AUTH_API_BASE_URL}/plan/providers`                                      |
+------------------+---------------------------------------------------------------------------+
| Method           | GET                                                                       |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Return list of provider plans for authenticated user                      |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 2: `Authorization: DXHUB <access_token>`, `Accept: application/json` |
+------------------+---------------------------------------------------------------------------+
| Request body     | None                                                                      |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 200, `Content-Type: application/json`                                |
|                  | List or paginated object of provider plan records                         |
+------------------+---------------------------------------------------------------------------+
| Error Response   | HTTP 401 — missing/invalid/expired token                                  |
|                  | HTTP 404/405 — POST or unsupported method on same URL                      |
+------------------+---------------------------------------------------------------------------+

---

### 4.3 Console — Plan management

#### 4.3.1 Create Plan

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{BASE_URL}/plan/provider`                                                |
+------------------+---------------------------------------------------------------------------+
| Method           | POST                                                                      |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Create a new provider plan record                                         |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 2                                                                 |
+------------------+------------------+------------------+------------------+------------------+
| Input Parameters | Field            | Type             | Required         | Description      |
|                  +------------------+------------------+------------------+------------------+
|                  | provider         | Integer          | Yes              | Valid provider ID|
|                  +------------------+------------------+------------------+------------------+
|                  | plan_name        | String           | Yes              | Max 250 chars    |
|                  +------------------+------------------+------------------+------------------+
|                  | plan_code        | String           | Yes              | Max 100 chars;   |
|                  |                  |                  |                  | unique per env   |
|                  +------------------+------------------+------------------+------------------+
|                  | type             | Integer          | Yes              | 1 = Origin,      |
|                  |                  |                  |                  | 2 = Recharge     |
|                  +------------------+------------------+------------------+------------------+
|                  | plan_type        | Integer          | Yes              | 1 = Data,        |
|                  |                  |                  |                  | 2 = Voice,       |
|                  |                  |                  |                  | 3 = Combo        |
|                  +------------------+------------------+------------------+------------------+
|                  | billing_type     | Integer          | Yes              | 1 = Prepaid,     |
|                  |                  |                  |                  | 2 = Postpaid     |
|                  +------------------+------------------+------------------+------------------+
|                  | description      | String           | Yes              | Max 255 chars    |
+------------------+------------------+------------------+------------------+------------------+
| Sample request   | {                                                                         |
| body             |   "provider": 9,                                                          |
|                  |   "plan_name": "ValidPlanName_1748084500",                                |
|                  |   "plan_code": "ValidPlanCode_1748084500",                                |
|                  |   "type": 1,                                                              |
|                  |   "plan_type": 1,                                                         |
|                  |   "billing_type": 1,                                                      |
|                  |   "description": "Valid plan description for automation testing"          |
|                  | }                                                                         |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 200 or 201                                                         |
|                  | Response includes created plan `id` (or `data.id` / `pk`)                 |
+------------------+---------------------------------------------------------------------------+
| Error Response   | HTTP 400/422 — validation (missing/null/invalid/over-max fields)          |
|                  | HTTP 401 — missing/invalid token                                          |
|                  | HTTP 404 — invalid provider reference                                     |
|                  | HTTP 404/405 — GET on create URL                                          |
+------------------+---------------------------------------------------------------------------+

**Field validation summary:**

| Field | Rules |
|-------|-------|
| provider | Required integer; must exist |
| plan_name | Required; max 250; unique recommended |
| plan_code | Required; max 100; unique recommended |
| type | Required; allowed: 1, 2 |
| plan_type | Required; allowed: 1, 2, 3 |
| billing_type | Required; allowed: 1, 2 |
| description | Required; max 255 |

**Note:** Backend may coerce numeric strings (e.g. `"1"`) to integers — use non-convertible values (`"@"`) for invalid datatype tests.

---

#### 4.3.2 Edit Plan

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{BASE_URL}/plan/provider/{plan_id}`                                      |
+------------------+---------------------------------------------------------------------------+
| Method           | PATCH                                                                     |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Update an existing plan (partial or full body)                            |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 2                                                                 |
+------------------+------------------+------------------+------------------+------------------+
| Input Parameters | Same schema as Create Plan (partial update supported)                     |
+------------------+---------------------------------------------------------------------------+
| Sample request   | { "plan_name": "UpdatedPlanName_1748084500" }  (partial)                  |
| body             | or full create schema for full update                                     |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 200                                                                  |
+------------------+---------------------------------------------------------------------------+
| Error Response   | HTTP 404 — plan_id not found                                              |
|                  | HTTP 400/422 — over-max length, unsupported enum values                     |
|                  | HTTP 401 — no/invalid token                                               |
|                  | HTTP 404/405 — POST instead of PATCH                                      |
+------------------+---------------------------------------------------------------------------+

**Precondition:** Valid `plan_id` from prior Create Plan.

---

#### 4.3.3 Delete Plan

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{BASE_URL}/plan/provider/{plan_id}`                                      |
+------------------+---------------------------------------------------------------------------+
| Method           | DELETE                                                                    |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Remove an existing plan record                                            |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 2                                                                 |
+------------------+---------------------------------------------------------------------------+
| Request body     | None                                                                      |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 200 or 204                                                           |
+------------------+---------------------------------------------------------------------------+
| Error Response   | HTTP 404 — plan_id not found                                              |
|                  | HTTP 401 — missing token                                                  |
|                  | HTTP 404/405 — GET instead of DELETE                                      |
+------------------+---------------------------------------------------------------------------+

---

#### 4.3.4 Plan Detailed View

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{BASE_URL}/plan/provider/{plan_id}`                                      |
+------------------+---------------------------------------------------------------------------+
| Method           | GET                                                                       |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Retrieve full details of a single plan by ID                              |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 2                                                                 |
+------------------+---------------------------------------------------------------------------+
| Request body     | None                                                                      |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 200, JSON object with plan fields                                    |
+------------------+---------------------------------------------------------------------------+
| Error Response   | HTTP 404 — plan_id not found                                              |
|                  | HTTP 401 — missing token                                                  |
+------------------+---------------------------------------------------------------------------+

**Note:** Confirm GET path with backend if contract differs from Postman collection.

---

### 4.4 Console — Discount management

#### 4.4.1 Create Discount

+------------------+------------------+------------------+------------------+------------------+
| Request URI      | `{BASE_URL}/discount`                                                     |
+------------------+---------------------------------------------------------------------------+
| Method           | POST                                                                      |
+------------------+---------------------------------------------------------------------------+
| Purpose          | Create a new discount/coupon record                                       |
+------------------+---------------------------------------------------------------------------+
| Request Header   | Pattern 2                                                                 |
+------------------+------------------+------------------+------------------+------------------+
| Input Parameters | Field            | Type             | Required         | Description      |
|                  +------------------+------------------+------------------+------------------+
|                  | code             | String           | Yes              | Unique discount  |
|                  |                  |                  |                  | code             |
|                  +------------------+------------------+------------------+------------------+
|                  | name             | String           | Yes              | Display name     |
|                  +------------------+------------------+------------------+------------------+
|                  | service_id       | Integer          | Yes              | Valid service ID |
|                  +------------------+------------------+------------------+------------------+
|                  | coupon_type      | Integer          | Yes              | 1 = Initial,     |
|                  |                  |                  |                  | 2 = Monthly      |
|                  +------------------+------------------+------------------+------------------+
|                  | discount_mode    | Integer          | Yes              | 1 = Fixed Amount,|
|                  |                  |                  |                  | 2 = Percentage   |
|                  +------------------+------------------+------------------+------------------+
|                  | value            | Number           | Yes              | > 0              |
|                  +------------------+------------------+------------------+------------------+
|                  | status           | Integer          | Yes              | 1 = Enabled,     |
|                  |                  |                  |                  | 2 = Disabled     |
|                  +------------------+------------------+------------------+------------------+
|                  | start_date       | String (date)    | Yes              | Format YYYY-MM-DD|
|                  +------------------+------------------+------------------+------------------+
|                  | end_date         | String (date)    | Yes              | Format YYYY-MM-DD|
|                  |                  |                  |                  | >= start_date    |
+------------------+------------------+------------------+------------------+------------------+
| Sample request   | {                                                                         |
| body             |   "code": "ValidDiscountCode_1748084500",                                 |
|                  |   "name": "ValidDiscountName_1748084500",                                 |
|                  |   "service_id": 1,                                                      |
|                  |   "coupon_type": 1,                                                       |
|                  |   "discount_mode": 1,                                                     |
|                  |   "value": 10,                                                            |
|                  |   "status": 1,                                                            |
|                  |   "start_date": "2026-04-01",                                             |
|                  |   "end_date": "2026-05-01"                                                |
|                  | }                                                                         |
+------------------+---------------------------------------------------------------------------+
| Success Response | HTTP 201                                                                  |
|                  | { "message": "Discount created successfully", "code": "<request code>" }  |
+------------------+---------------------------------------------------------------------------+
| Error Response   | HTTP 400 — validation, duplicate code, invalid dates                        |
|                  | HTTP 401 — missing/invalid token                                          |
|                  | HTTP 404 — invalid service_id                                             |
|                  | HTTP 404/405 — GET on create URL                                          |
+------------------+---------------------------------------------------------------------------+

**Enum reference:**

| Field | Allowed values |
|-------|----------------|
| discount_mode | 1 Fixed Amount, 2 Percentage |
| coupon_type | 1 Initial, 2 Monthly |
| status | 1 Enabled, 2 Disabled |

---

## 5. Cross-API requirements

### 5.1 HTTP status expectations (automation)

| Scenario | Expected status |
|----------|-----------------|
| Valid create (Plan) | 200 or 201 |
| Valid create (Discount) | 201 |
| Valid update (Plan) | 200 |
| Valid delete (Plan) | 200 or 204 |
| Valid read | 200 |
| Missing/invalid auth | 401 |
| Not found | 404 |
| Validation failure | 400 or 422 |
| Wrong HTTP method | 404 or 405 |
| Malformed JSON | 400 |
| Wrong Content-Type | 400 or 415 |

### 5.2 Test data conventions (automation)

- Meaningful values with timestamp: `ValidPlanName_1748084500`
- Boundary: `MaxLengthValidationPlanName_<timestamp>`
- Over-max: `ExceedMaxLengthValidationPlanName_<timestamp>`
- Duplicate test: fixed code `DuplicateValidationCode` (intentionally reused)
- Invalid integer type: `"@"` (not numeric strings like `"1"`)

### 5.3 Dependencies between APIs

```
Login → access token
  ├── Provider Plan List (GET)
  ├── Create Plan → plan_id
  │     ├── Edit Plan (PATCH)
  │     ├── Plan Detailed View (GET)
  │     └── Delete Plan (DELETE)
  └── Create Discount (POST)
```

---

## 6. Automation mapping

| Requirement doc section | Spec file | Test case JSON |
|-------------------------|-----------|----------------|
| 4.1.1 Login | `tests/api/login.api.spec.ts` | `test-cases/login-api/` |
| 4.2.1 Provider Plan List | `tests/api/provider-plan-list.api.spec.ts` | `test-cases/provider-plan-list-api/` |
| 4.3.1 Create Plan | `tests/api/create-plan.api.spec.ts` | `test-cases/create-plan-api/` |
| 4.3.2 Edit Plan | `tests/api/edit-plan.api.spec.ts` | `test-cases/edit-plan-api/` |
| 4.3.3 Delete Plan | `tests/api/delete-plan.api.spec.ts` | `test-cases/delete-plan-api/` |
| 4.3.4 Plan Detailed View | `tests/api/plan-detailed-view.api.spec.ts` | `test-cases/plan-detailed-view-api/` |
| 4.4.1 Create Discount | `tests/api/create-discount.api.spec.ts` | `test-cases/create-discount-api/` |

---

## 7. Open items / confirm with backend

1. Plan Detailed View GET URL — assumed `/plan/provider/{id}`; confirm if different.
2. Create Plan success status — 200 vs 201 (automation accepts both).
3. Delete Plan success status — 200 vs 204 (automation accepts both).
4. Login account lockout (429 / errorCode 104) — manual/environment test only (API_TC_021).
5. Create Plan dependency failure (API_TC_057) — not feasible for automation without mock.

---

## 8. Revision history

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-22 | Initial consolidated requirements for all 7 DXHUB APIs in automation project |
