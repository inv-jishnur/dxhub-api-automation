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
  const status = res.status();
  await allure.parameter('Response status code', String(status));
  await allure.attachment(
    'Response status',
    `HTTP ${status} ${res.statusText()}`,
    'text/plain'
  );
  await allure.attachment(
    'Response headers',
    JSON.stringify(res.headers(), null, 2),
    'application/json'
  );
}

/** Wrap an HTTP status assertion in an Allure step with readable expected/received labels. */
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

    const fail = async (message: string): Promise<never> => {
      let body = '';
      try {
        body = await res.text();
      } catch {
        body = '(could not read response body)';
      }
      const detail = `${message}\n\nActual HTTP status: ${status}\nResponse body:\n${body}`;
      await allure.attachment('HTTP status assertion — failed', detail, 'text/plain');
      // Do not use expect(allowed).toContain(status) — Playwright swaps labels in Allure:
      // "Expected value: 201" / "Received array: [400, 422]" reads as if 201 were expected.
      expect(false, message + (body ? `\nResponse body: ${body.slice(0, 1000)}` : '')).toBe(true);
    };

    if (Array.isArray(expected)) {
      const allowed = [...expected];
      if (!allowed.includes(status)) {
        await fail(`Expected HTTP status in [${allowed.join(', ')}], received HTTP ${status}`);
      }
      await allure.attachment(
        'HTTP status assertion — passed',
        `Expected one of [${allowed.join(', ')}], received HTTP ${status}`,
        'text/plain'
      );
      return;
    }

    if (status !== expected) {
      await fail(`Expected HTTP ${expected}, received HTTP ${status}`);
    }
    await allure.attachment(
      'HTTP status assertion — passed',
      `Expected HTTP ${expected}, received HTTP ${status}`,
      'text/plain'
    );
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
