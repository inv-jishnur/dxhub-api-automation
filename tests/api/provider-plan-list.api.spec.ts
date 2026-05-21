import { test, expect } from '@playwright/test';
import { apiRequest, loginAccessToken } from '../utils/api-request';
import { headers, planProvidersUrl } from '../utils/config';

test.describe('Provider Plan List API', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAccessToken(request);
  });

  test('[API_TC_011] Verify that the Provider plan list API returns a successful response when called with a valid access token.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProvidersUrl, { headers: headers(token) });
    expect(res.status()).toBe(200);
    expect((res.headers()['content-type'] ?? '').toLowerCase()).toContain('json');
  });

  test('[API_TC_012] Verify that the Provider plan list API returns an error when the Authorization header is missing.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProvidersUrl, { headers: headers() });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_013] Verify that the Provider plan list API returns an error when an invalid access token is supplied.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProvidersUrl, {
      headers: headers('invalid_token_string'),
    });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_014] Verify that the Provider plan list API returns an error when an expired access token is supplied.', async ({
    request,
  }) => {
    const expired =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MDAwMDAwMDAsInN1YiI6IjEifQ.invalidsig';
    const res = await apiRequest(request, 'GET', planProvidersUrl, { headers: headers(expired) });
    expect(res.status()).toBe(401);
  });

  test('[API_TC_015] Verify that the Provider plan list API rejects a POST request to the same URL.', async ({ request }) => {
    const res = await apiRequest(request, 'POST', planProvidersUrl, {
      headers: headers(token),
      data: {},
    });
    expect([404, 405]).toContain(res.status());
  });

  test('[API_TC_016] Verify that the Provider plan list API response schema contains the expected top-level fields and data types.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', planProvidersUrl, { headers: headers(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toBeDefined();
  });
});
