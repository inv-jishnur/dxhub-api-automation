import { allure } from 'allure-playwright';
import { expect, type APIResponse } from '@playwright/test';

/** Redact sensitive fields before attaching request payloads to Allure. */
export function sanitizePayload(data: unknown): string {
  if (data === undefined) return '(none)';
  try {
    return JSON.stringify(data, null, 2).replace(
      /"(password|access|refresh|token|access_token)"\s*:\s*"[^"]*"/gi,
      '"$1": "***"'
    );
  } catch {
    return String(data);
  }
}

/** Attach API request metadata to the current test (method, URL, optional body). */
export async function attachApiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<void> {
  await allure.parameter('HTTP Method', method);
  await allure.parameter('URL', url);
  if (data !== undefined) {
    await allure.attachment('Request body', sanitizePayload(data), 'application/json');
  }
}

/** Attach response status (and headers) without consuming the response body. */
export async function attachApiResponse(res: APIResponse): Promise<void> {
  await allure.attachment(
    'Response status',
    `HTTP ${res.status()} ${res.statusText()}`,
    'text/plain'
  );
  await allure.attachment(
    'Response headers',
    JSON.stringify(res.headers(), null, 2),
    'application/json'
  );
}

/** Wrap an HTTP status assertion in an Allure step (visible in the report). */
export async function assertHttpStatus(
  res: APIResponse,
  expected: number | readonly number[],
  description?: string
): Promise<void> {
  const label =
    description ??
    (Array.isArray(expected)
      ? `Assert HTTP status is one of [${expected.join(', ')}]`
      : `Assert HTTP status is ${expected}`);

  await allure.step(label, async () => {
    const status = res.status();
    if (Array.isArray(expected)) {
      expect(
        expected,
        `Expected status in [${expected.join(', ')}], got ${status}`
      ).toContain(status);
    } else {
      expect(status, `Expected HTTP ${expected}, got ${status}`).toBe(expected);
    }
    await allure.attachment('Assertion result', `HTTP ${status} — passed`, 'text/plain');
  });
}

/** Wrap a JSON field assertion in an Allure step. */
export async function assertJsonField(
  body: Record<string, unknown>,
  field: string,
  check: (value: unknown) => void,
  description?: string
): Promise<void> {
  await allure.step(description ?? `Assert response field "${field}"`, async () => {
    check(body[field]);
    await allure.attachment(
      'Assertion result',
      `Field "${field}" validated successfully`,
      'text/plain'
    );
  });
}
