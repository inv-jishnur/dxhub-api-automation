import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { apiRequest } from '../utils/api-request';
import { assertHttpStatus, assertJsonField } from '../utils/allure-api';
import { credentials, headers, loginUrl } from '../utils/config';

/**
 * Example spec demonstrating Allure reporting for API automation.
 * Run: npm run test:allure-example
 */
test.describe('Allure API reporting example', () => {
  test.beforeEach(async () => {
    await allure.epic('DXHUB API Automation');
    await allure.feature('Login API');
    await allure.layer('API');
    await allure.tag('allure-example');
  });

  test('[ALLURE_EXAMPLE_001] Verify that the Login API success scenario is reported with API steps and assertions in Allure.', async ({
    request,
  }) => {
    await allure.story('Successful login');
    await allure.displayName('Login API — valid credentials (Allure example)');

    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: credentials.validPassword },
    });

    await assertHttpStatus(res, 200, 'Verify Login API returns HTTP 200');
    const body = (await res.json()) as Record<string, unknown>;

    await assertJsonField(body, 'access', (v) => {
      expect(typeof v).toBe('string');
      expect(v).toBeTruthy();
    });
    await assertJsonField(body, 'refresh', (v) => {
      expect(typeof v).toBe('string');
      expect(v).toBeTruthy();
    });
  });

  test('[ALLURE_EXAMPLE_002] Verify that a failed Login API assertion appears as failed in the Allure report.', async ({
    request,
  }) => {
    await allure.story('Failed assertion (demo)');

    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: credentials.validPassword },
    });

    await assertHttpStatus(res, 500, 'Intentionally wrong expected status for demo');
  });

  test.skip('[ALLURE_EXAMPLE_003] Verify that skipped tests appear as skipped in the Allure report.', async () => {
    await allure.story('Skipped test (demo)');
  });
});
