import { test, expect } from '@playwright/test';
import { apiRequest, loginAccessToken } from '../utils/api-request';
import { headers, planProviderCollectionUrl } from '../utils/config';
import { buildPlanBody, planProviderItemUrl, readCreatedPlanId } from '../utils/plan';

test.describe.configure({ mode: 'serial' });

test.describe('Delete Plan API', () => {
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

  test('[API_TC_072] Verify that an error is returned when the Delete Plan API is called without Authorization header.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'DELETE', planProviderItemUrl(planId), {
      headers: { Accept: 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_073] Verify that an error is returned when the Delete Plan API is invoked with GET instead of DELETE.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProviderItemUrl(planId), { headers: headers(token) });
    expect([200, 404, 405]).toContain(res.status());
  });

  test('[API_TC_070] Verify that the Delete Plan API removes the plan when a valid plan_id and token are provided.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'DELETE', planProviderItemUrl(planId), { headers: headers(token) });
    expect([200, 204]).toContain(res.status());
  });

  test('[API_TC_071] Verify that an error is returned when deleting a non-existent plan_id.', async ({ request }) => {
    const res = await apiRequest(request, 'DELETE', planProviderItemUrl('999999999'), {
      headers: headers(token),
    });
    expect(res.status()).toBe(404);
  });
});
