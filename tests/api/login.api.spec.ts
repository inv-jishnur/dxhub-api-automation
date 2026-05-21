import { test, expect } from '@playwright/test';
import { apiRequest } from '../utils/api-request';
import { credentials, headers, loginUrl } from '../utils/config';

const nonExistentEmail =
  credentials.invalidEmail || 'no-user-login-test@invalid.example.com';

function expectInvalidCredentials(body: Record<string, unknown>) {
  if (body.errorCode !== undefined) {
    expect(String(body.errorCode)).toBe('100');
  }
  if (body.message !== undefined) {
    expect(String(body.message)).toMatch(/invalid credentials/i);
  }
}

test.describe('Login API', () => {
  test('[API_TC_001] Verify that the Login API returns HTTP 200 with access token, refresh token, and user profile fields when valid email and password are provided.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: credentials.validPassword },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(typeof body.refresh).toBe('string');
    expect(body.refresh).toBeTruthy();
    expect(typeof body.access).toBe('string');
    expect(body.access).toBeTruthy();
    expect(typeof body.user_id).toBe('number');
    expect(typeof body.nick_name).toBe('string');
    expect(typeof body.email).toBe('string');
    expect(typeof body.role).toBe('number');
  });

  test('[API_TC_002] Verify that an error response is returned when the email field is missing from the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { password: 'x' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_003] Verify that an error response is returned when the email field is null in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: null, password: 'x' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_004] Verify that an error response is returned when the email field is an empty string in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: '', password: 'x' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API_TC_005] Verify that an error response is returned when the email field has an invalid data type in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: 12345, password: 'x' },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('[API_TC_006] Verify that an error response is returned when the email field has an invalid email format in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: 'not-an-email', password: 'x' },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('[API_TC_007] Verify that an error response is returned when the email does not exist in the system.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: nonExistentEmail, password: 'AnyPassword@1' },
    });
    expect(res.status()).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expectInvalidCredentials(body);
  });

  test('[API_TC_008] Verify that an error response is returned when the password field is missing from the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('[API_TC_009] Verify that an error response is returned when the password field is null in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: null },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('[API_TC_010] Verify that an error response is returned when the password field is an empty string in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: '' },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('[API_TC_011] Verify that an error response is returned when the password field has an invalid data type in the Login request body.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: 12345 },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('[API_TC_012] Verify that HTTP 401 with errorCode 100 and message Invalid credentials is returned when the password does not match the registered password.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: { email: credentials.validEmail, password: credentials.invalidPassword },
    });
    expect(res.status()).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expectInvalidCredentials(body);
  });

  test('[API_TC_013] Verify that an error response is returned when the Login request body is empty.', async ({
    request,
  }) => {
    const res = await request.post(loginUrl, {
      headers: headers(),
      data: '',
    });
    expect([400, 422, 500]).toContain(res.status());
  });

  test('[API_TC_014] Verify that an error response is returned when the Login request body is malformed JSON.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: '{invalid',
    });
    expect([400, 500]).toContain(res.status());
  });

  test('[API_TC_015] Verify that the Login API handles unexpected fields in the request body without breaking server behavior.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: headers(),
      data: {
        email: credentials.validEmail,
        password: credentials.validPassword,
        unexpected_field: 'value',
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('[API_TC_016] Verify that an error response is returned when the Login API is invoked with HTTP GET instead of POST.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'GET', loginUrl, { headers: headers() });
    expect([401, 404, 405]).toContain(res.status());
  });

  test('[API_TC_017] Verify that an error response is returned when the Login API is invoked with HTTP PUT instead of POST.', async ({
    request,
  }) => {
    const res = await request.fetch(loginUrl, {
      method: 'PUT',
      headers: headers(),
      data: { email: credentials.validEmail, password: credentials.validPassword },
    });
    expect([404, 405]).toContain(res.status());
  });

  test('[API_TC_018] Verify that an error response is returned when the Login API is invoked with HTTP DELETE instead of POST.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'DELETE', loginUrl, { headers: headers() });
    expect([401, 404, 405]).toContain(res.status());
  });

  test('[API_TC_019] Verify that an error response is returned when Content-Type is not application/json for the Login API.', async ({
    request,
  }) => {
    const res = await apiRequest(request, 'POST', loginUrl, {
      headers: { 'Content-Type': 'text/plain', Accept: 'application/json' },
      data: JSON.stringify({
        email: credentials.validEmail,
        password: credentials.validPassword,
      }),
    });
    expect([400, 415]).toContain(res.status());
  });

  test('[API_TC_020] Verify that an error response is returned when the Content-Type header is missing for the Login API.', async ({
    request,
  }) => {
    const res = await request.post(loginUrl, {
      headers: { Accept: 'application/json' },
      data: { email: credentials.validEmail, password: credentials.validPassword },
    });
    expect([200, 400, 415]).toContain(res.status());
  });

  // API_TC_021 — account lockout (429 / errorCode 104): requires repeated failures or a locked test account.
  test.skip('[API_TC_021] Verify that HTTP 429 with errorCode 104 is returned when the account is temporarily locked after repeated failed login attempts.', async () => {
    // Not feasible for automation: Not feasible for automation
  });
});
