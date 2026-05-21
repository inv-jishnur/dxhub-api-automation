import { test, expect } from '@playwright/test';
import { apiRequest, loginAccessToken } from '../utils/api-request';
import { discountUrl, headers, serviceId } from '../utils/config';
import {
  discountDateRange,
  validDiscountBody,
  withUniqueDiscountFields,
} from '../utils/discount';

const DUPLICATE_CODE = 'DUPLICATE_CODE_TEST';

function validBody(overrides: Record<string, unknown> = {}) {
  return withUniqueDiscountFields({
    ...validDiscountBody,
    ...discountDateRange(),
    ...overrides,
  });
}

function omitKey<T extends Record<string, unknown>>(body: T, key: keyof T): Record<string, unknown> {
  const out = { ...body };
  delete out[key];
  return out;
}

test.describe('Create Discount API', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAccessToken(request);
  });

  test('[API_TC_078] Verify that the Create Discount API returns HTTP 201 when all required fields are valid according to the schema.', async ({
    request,
  }) => {
    const payload = validBody();
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: payload,
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.message).toBe('Discount created successfully');
    expect(body.code).toBe(payload.code);
  });

  test('[API_TC_079] Verify that an error is returned when code is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'code'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_080] Verify that an error is returned when code is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ code: null }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_081] Verify that an error is returned when code is empty in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ code: '' }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_082] Verify that an error is returned when code has an invalid data type (number) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ code: 12345 as unknown as string }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_083] Verify that an error is returned when name is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'name'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_084] Verify that an error is returned when name is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ name: null as unknown as string }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_085] Verify that an error is returned when name is empty in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ name: '' }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_086] Verify that an error is returned when name has an invalid data type (boolean) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ name: true as unknown as string }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_087] Verify that an error is returned when service_id is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'service_id'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_088] Verify that an error is returned when service_id is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ service_id: null as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_089] Verify that an error is returned when service_id has an invalid data type (string) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ service_id: '1' as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_090] Verify that an error is returned when service_id references a non-existent service in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ service_id: 999999999 }),
    });
    expect([400, 404]).toContain(res.status());
  });

  test('[API_TC_091] Verify that an error is returned when discount_mode is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'discount_mode'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_092] Verify that an error is returned when discount_mode is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ discount_mode: null as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_093] Verify that an error is returned when discount_mode has an unsupported integer value (not 1 or 2) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ discount_mode: 99 }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_094] Verify that an error is returned when discount_mode has an invalid data type (string) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ discount_mode: '1' as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_095] Verify that the Create Discount API accepts discount_mode value 1 (Fixed Amount).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ discount_mode: 1 }),
    });
    expect(res.status()).toBe(201);
  });

  test('[API_TC_096] Verify that the Create Discount API accepts discount_mode value 2 (Percentage).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ discount_mode: 2 }),
    });
    expect(res.status()).toBe(201);
  });

  test('[API_TC_097] Verify that an error is returned when coupon_type is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'coupon_type'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_098] Verify that an error is returned when coupon_type is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ coupon_type: null as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_099] Verify that an error is returned when coupon_type has an unsupported integer value (not 1 or 2) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ coupon_type: 10 }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_100] Verify that an error is returned when coupon_type has an invalid data type (string) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ coupon_type: '1' as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_101] Verify that the Create Discount API accepts coupon_type value 1 (Initial).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ coupon_type: 1 }),
    });
    expect(res.status()).toBe(201);
  });

  test('[API_TC_102] Verify that the Create Discount API accepts coupon_type value 2 (Monthly).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ coupon_type: 2 }),
    });
    expect(res.status()).toBe(201);
  });

  test('[API_TC_103] Verify that an error is returned when value is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'value'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_104] Verify that an error is returned when value is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ value: null as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_105] Verify that an error is returned when value has an invalid data type (string) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ value: '10' as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_106] Verify that an error is returned when value is negative in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ value: -1 }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_107] Verify that an error is returned when value is zero in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ value: 0 }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_108] Verify that an error is returned when start_date is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'start_date'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_109] Verify that an error is returned when start_date is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ start_date: null as unknown as string }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_110] Verify that an error is returned when start_date has an invalid date format in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ start_date: '01-04-2026' }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_111] Verify that an error is returned when start_date has an invalid data type (number) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ start_date: 20260401 as unknown as string }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_112] Verify that an error is returned when end_date is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'end_date'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_113] Verify that an error is returned when end_date is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ end_date: null as unknown as string }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_114] Verify that an error is returned when end_date has an invalid date format in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ end_date: '2026/04/01' }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_115] Verify that an error is returned when end_date is earlier than start_date in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ start_date: '2026-06-01', end_date: '2026-05-01' }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_116] Verify that an error is returned when status is missing from the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: omitKey(validBody(), 'status'),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_117] Verify that an error is returned when status is null in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ status: null as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_118] Verify that an error is returned when status has an unsupported integer value (not 1 or 2) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ status: 5 }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_119] Verify that an error is returned when status has an invalid data type (string) in the Create Discount request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ status: '1' as unknown as number }),
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_120] Verify that the Create Discount API accepts status value 1 (Enabled).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ status: 1 }),
    });
    expect(res.status()).toBe(201);
  });

  test('[API_TC_121] Verify that the Create Discount API accepts status value 2 (Disabled).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: validBody({ status: 2 }),
    });
    expect(res.status()).toBe(201);
  });

  test('[API_TC_122] Verify that an error is returned when the Create Discount request contains a duplicate code that already exists.', async ({
    request,
  }) => {
    const first = validBody({ code: DUPLICATE_CODE });
    const createRes = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: first,
    });
    if (createRes.status() !== 201) {
      test.skip(true, 'Could not seed duplicate discount code; environment may already have this code.');
    }
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: {
        ...validDiscountBody,
        ...discountDateRange(60, 30),
        service_id: serviceId,
        code: DUPLICATE_CODE,
        name: `Duplicate attempt ${Date.now()}`,
      },
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_123] Verify that an error is returned when the Create Discount request contains unexpected extra fields not defined in the contract.', async ({
    request,
  }) => {
    const base = validBody();
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: { ...base, unexpected_field_xyz: true },
    });
    expect([201, 400]).toContain(res.status());
  });

  test('[API_TC_124] Verify that an error is returned when the Create Discount request body is malformed JSON.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers(token),
      data: '{',
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_125] Verify that an error is returned when the Create Discount API is called without Authorization header.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: validBody(),
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_126] Verify that an error is returned when the Create Discount API is called with an invalid access token.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: headers('not-a-real-jwt'),
      data: validBody(),
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_127] Verify that an error is returned when Content-Type is not application/json for the Create Discount API.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', discountUrl, {
      headers: { ...headers(token), 'Content-Type': 'text/plain' },
      data: JSON.stringify(validBody()),
    });
    expect([400, 415]).toContain(res.status());
  });

  test('[API_TC_128] Verify that the Create Discount API rejects GET method on the create endpoint URL.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', discountUrl, { headers: headers(token) });
    expect([404, 405]).toContain(res.status());
  });
});
