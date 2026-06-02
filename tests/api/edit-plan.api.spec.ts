import { test, expect } from '@playwright/test';
import { assertHttpStatus } from '../utils/allure-api';
import { apiRequest, loginAccessToken } from '../utils/api-request';
import { headers, planProviderCollectionUrl } from '../utils/config';
import {
  buildPlanBody,
  meaningfulTestValue,
  PlanDataLabels,
  planProviderItemUrl,
  readCreatedPlanId,
  stringAtExactLength,
} from '../utils/plan';

test.describe.configure({ mode: 'serial' });

test.describe('Edit Plan API', () => {
  let token: string;
  let planId: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAccessToken(request);
    const createRes = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody(),
    });
    await assertHttpStatus(createRes, [200, 201]);
    planId = await readCreatedPlanId(createRes);
  });

  test('[API_TC_058] Verify that the Edit Plan API updates successfully when plan_name is sent with a valid value (partial update).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { plan_name: meaningfulTestValue(PlanDataLabels.updatedName) },
    });
    expect(res.status()).toBe(200);
  });

  test('[API_TC_059] Verify that the Edit Plan API updates successfully when all schema fields are sent with valid values.', async ({
    request,
  }) => {
    const body = buildPlanBody({ plan_name: PlanDataLabels.fullUpdateName });
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: body,
    });
    expect(res.status()).toBe(200);
  });

  test('[API_TC_060] Verify that an error is returned when plan_id in the Edit Plan URL path is non-existent.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl('999999999'), {
      headers: headers(token),
      data: { plan_name: meaningfulTestValue('NonExistentPlanUpdateTest') },
    });
    expect(res.status()).toBe(404);
  });

  test('[API_TC_061] Verify that an error is returned when plan_name exceeds 250 characters in the Edit Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { plan_name: stringAtExactLength(251, PlanDataLabels.exceedMaxLengthName) },
    });
    await assertHttpStatus(res, [400, 422]);
  });

  test('[API_TC_062] Verify that an error is returned when plan_code exceeds 100 characters in the Edit Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { plan_code: stringAtExactLength(101, PlanDataLabels.exceedMaxLengthCode) },
    });
    await assertHttpStatus(res, [400, 422]);
  });

  test('[API_TC_063] Verify that an error is returned when type has an unsupported value in the Edit Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { type: 99 },
    });
    await assertHttpStatus(res, [400, 422]);
  });

  test('[API_TC_064] Verify that an error is returned when plan_type has an unsupported value in the Edit Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { plan_type: 99 },
    });
    await assertHttpStatus(res, [400, 422]);
  });

  test('[API_TC_065] Verify that an error is returned when billing_type has an unsupported value in the Edit Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { billing_type: 5 },
    });
    await assertHttpStatus(res, [400, 422]);
  });

  test('[API_TC_066] Verify that an error is returned when description exceeds 255 characters in the Edit Plan request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { description: stringAtExactLength(256, PlanDataLabels.exceedMaxLengthDescription) },
    });
    await assertHttpStatus(res, [400, 422]);
  });

  test('[API_TC_067] Verify that an error is returned when the Edit Plan API is called without Authorization header.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: { plan_name: meaningfulTestValue('NonExistentPlanUpdateTest') },
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_068] Verify that an error is returned when the Edit Plan API is invoked with POST instead of PATCH.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', planProviderItemUrl(planId), {
      headers: headers(token),
      data: { plan_name: meaningfulTestValue('NonExistentPlanUpdateTest') },
    });
    await assertHttpStatus(res, [404, 405]);
  });

  test('[API_TC_069] Verify that an error is returned when the Edit Plan request body is malformed JSON.', async ({ request }) => {
    const res = await apiRequest(request, 'PATCH', planProviderItemUrl(planId), {
      headers: headers(token),
      data: '{',
    });
    expect(res.status()).toBe(400);
  });
});
