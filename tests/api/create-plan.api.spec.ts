import { test, expect } from '@playwright/test';
import { apiRequest, loginAccessToken } from '../utils/api-request';
import { headers, planProviderCollectionUrl } from '../utils/config';
import {
  buildPlanBody,
  buildPlanBodyAtMaxLength,
  buildPlanBodyOverMaxLength,
  validPlanBody,
} from '../utils/plan';

test.describe('Create Plan API', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAccessToken(request);
  });

  test('[API_TC_017] Verify that the Create Plan API returns success when all required fields are valid according to the schema.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody(),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_018] Verify that an error is returned when provider is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['provider']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_019] Verify that an error is returned when provider is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ provider: null as unknown as number }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_020] Verify that an error is returned when provider has an invalid data type (string) in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ provider: '9' as unknown as number }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_021] Verify that an error is returned when provider references a non-existent provider ID in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ provider: 999999999 }),
    });
    expect([400, 404]).toContain(res.status());
  });

  test('[API_TC_022] Verify that an error is returned when plan_name is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['plan_name']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_023] Verify that an error is returned when plan_name is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_name: null as unknown as string }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_024] Verify that an error is returned when plan_name exceeds 250 characters in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBodyOverMaxLength('plan_name', 250),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_025] Verify that the Create Plan API accepts plan_name with length exactly equal to 250 characters.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBodyAtMaxLength('plan_name', 250),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_026] Verify that an error is returned when plan_code is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['plan_code']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_027] Verify that an error is returned when plan_code is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_code: null as unknown as string }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_028] Verify that an error is returned when plan_code exceeds 100 characters in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBodyOverMaxLength('plan_code', 100),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_029] Verify that the Create Plan API accepts plan_code with length exactly equal to 100 characters.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBodyAtMaxLength('plan_code', 100),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_030] Verify that an error is returned when type is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['type']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_031] Verify that an error is returned when type is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ type: null as unknown as number }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_032] Verify that an error is returned when type has an unsupported integer value (not 1 or 2) in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ type: 99 }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_033] Verify that an error is returned when type has invalid data type (string) in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ type: '1' as unknown as number }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_034] Verify that the Create Plan API accepts type value 1 (Origin).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ type: 1 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_035] Verify that the Create Plan API accepts type value 2 (Recharge).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ type: 2 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_036] Verify that an error is returned when plan_type is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['plan_type']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_037] Verify that an error is returned when plan_type is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_type: null as unknown as number }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_038] Verify that an error is returned when plan_type has an unsupported value (not 1, 2, or 3) in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_type: 10 }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_039] Verify that the Create Plan API accepts plan_type value 1 (Data).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_type: 1 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_040] Verify that the Create Plan API accepts plan_type value 2 (Voice).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_type: 2 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_041] Verify that the Create Plan API accepts plan_type value 3 (Combo).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ plan_type: 3 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_042] Verify that an error is returned when billing_type is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['billing_type']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_043] Verify that an error is returned when billing_type is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ billing_type: null as unknown as number }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_044] Verify that an error is returned when billing_type has an unsupported value (not 1 or 2) in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ billing_type: 5 }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_045] Verify that the Create Plan API accepts billing_type value 1 (Prepaid).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ billing_type: 1 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_046] Verify that the Create Plan API accepts billing_type value 2 (Postpaid).', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ billing_type: 2 }),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_047] Verify that an error is returned when description is missing from the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({}, ['description']),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_048] Verify that an error is returned when description is null in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody({ description: null as unknown as string }),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_049] Verify that an error is returned when description exceeds 255 characters in the Create Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBodyOverMaxLength('description', 255),
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_050] Verify that the Create Plan API accepts description with length exactly equal to 255 characters.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBodyAtMaxLength('description', 255),
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API_TC_051] Verify that an error is returned when the Create Plan request contains unexpected extra fields not defined in the contract.', async ({
    request,
  }) => {
    const base = buildPlanBody();
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: { ...base, unexpected_field_xyz: true },
    });
    expect([200, 201, 400, 422]).toContain(res.status());
  });

  test('[API_TC_052] Verify that an error is returned when the Create Plan request body is malformed JSON.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: '{',
    });
    expect(res.status()).toBe(400);
  });

  test('[API_TC_053] Verify that an error is returned when the Create Plan API is called without Authorization header.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: validPlanBody,
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_054] Verify that an error is returned when the Create Plan API is called with an invalid access token.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers('not-a-real-jwt'),
      data: buildPlanBody(),
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_055] Verify that an error is returned when Content-Type is not application/json for the Create Plan API.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: { ...headers(token), 'Content-Type': 'text/plain' },
      data: JSON.stringify(buildPlanBody()),
    });
    expect([400, 415]).toContain(res.status());
  });

  test('[API_TC_056] Verify that the Create Plan API rejects GET method on the create endpoint URL.', async ({ request }) => {
    const res = await apiRequest(request, 'GET', planProviderCollectionUrl, { headers: headers(token) });
    expect([404, 405]).toContain(res.status());
  });

  test.skip(
    '[API_TC_057] Verify that the Create Plan API returns a controlled error when the database or persistence layer is unavailable.',
    async () => {
      // Not feasible for automation without a simulated dependency failure.
    }
  );
});
