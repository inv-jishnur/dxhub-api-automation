import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { attachApiRequest, attachApiResponse, sanitizePayload } from './allure-api';
import { credentials, headers, loginUrl } from './config';

function pickToken(body: Record<string, unknown>): string | undefined {
  if (typeof body.access === 'string') return body.access;
  if (typeof body.access_token === 'string') return body.access_token;
  if (typeof body.token === 'string') return body.token;
  const data = body.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.access === 'string') return d.access;
    if (typeof d.access_token === 'string') return d.access_token;
  }
  return undefined;
}

/** Login API → access token for subsequent calls. */
export async function loginAccessToken(request: APIRequestContext): Promise<string> {
  return allure.step('Login API — obtain access token', async () => {
    const payload = { email: credentials.validEmail, password: credentials.validPassword };
    await attachApiRequest('POST', loginUrl, payload);

    const res = await request.post(loginUrl, {
      headers: headers(),
      data: payload,
    });
    await attachApiResponse(res);

    expect(res.ok(), `Login failed: HTTP ${res.status()}`).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    const token = pickToken(body);
    expect(token, 'Login response should include an access token').toBeTruthy();
    return token as string;
  });
}

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Single entry point for API calls (JSON body or raw string body for malformed JSON tests).
 */
export async function apiRequest(
  request: APIRequestContext,
  method: ApiMethod,
  url: string,
  options: { headers: Record<string, string>; data?: unknown }
) {
  const { headers: h, data } = options;

  return allure.step(`API ${method} ${url}`, async () => {
    await attachApiRequest(method, url, data);

    let res;
    if (method === 'GET') {
      res = await request.get(url, { headers: h });
    } else if (method === 'DELETE') {
      res = await request.delete(url, { headers: h });
    } else {
      res = await request.fetch(url, {
        method,
        headers: h,
        ...(data !== undefined ? { data } : {}),
      });
    }

    await attachApiResponse(res);

    if (data !== undefined && typeof data === 'string') {
      await allure.attachment('Raw request body', sanitizePayload(data), 'text/plain');
    }

    return res;
  });
}
