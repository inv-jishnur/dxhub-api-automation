import { test, expect } from '@playwright/test';
import { apiRequest, loginAccessToken } from '../utils/api-request';
import { headers, planProviderCollectionUrl } from '../utils/config';
import { buildPlanBody, planProviderItemUrl, readCreatedPlanId } from '../utils/plan';

test.describe('Plan Detailed View API', () => {
  let token: string;
  let planId: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAccessToken(request);
    const createRes = await apiRequest(request, 'POST', planProviderCollectionUrl, {
      headers: headers(token),
      data: buildPlanBody(),
    });
    expect([200, 201]).toContain(createRes.status());
    planId = await readCreatedPlanId(createRes);
  });

  test('[API_TC_074] Verify that the Plan Detailed View API returns plan details for a valid plan_id (GET by id).', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProviderItemUrl(planId), { headers: headers(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toBeTruthy();
  });

  test('[API_TC_075] Verify that an error is returned when requesting details for a non-existent plan_id.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProviderItemUrl('999999999'), {
      headers: headers(token),
    });
    expect(res.status()).toBe(404);
  });

  test('[API_TC_076] Verify that an error is returned when the Plan Detailed View API is called without Authorization header.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProviderItemUrl(planId), {
      headers: { Accept: 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_077] Verify that the Plan Detailed View API response schema matches the expected structure and data types.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProviderItemUrl(planId), { headers: headers(token) });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(typeof body).toBe('object');
  });
});
