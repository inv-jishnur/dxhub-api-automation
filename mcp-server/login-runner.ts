/**
 * Login API automation logic aligned with tests/api/login.api.spec.ts (API_TC_001–API_TC_021).
 * Uses Node fetch; no Playwright dependency.
 */
import { credentials, headers, loginUrl } from '../tests/utils/config';
import { loginFetch } from './fetch-api';

export const LOGIN_TEST_CASE_IDS = [
  'API_TC_001',
  'API_TC_002',
  'API_TC_003',
  'API_TC_004',
  'API_TC_005',
  'API_TC_006',
  'API_TC_007',
  'API_TC_008',
  'API_TC_009',
  'API_TC_010',
  'API_TC_011',
  'API_TC_012',
  'API_TC_013',
  'API_TC_014',
  'API_TC_015',
  'API_TC_016',
  'API_TC_017',
  'API_TC_018',
  'API_TC_019',
  'API_TC_020',
  'API_TC_021',
] as const;

export const LOGIN_AUTOMATABLE_IDS = LOGIN_TEST_CASE_IDS.filter((id) => id !== 'API_TC_021');

export type LoginTestCaseId = (typeof LOGIN_TEST_CASE_IDS)[number];

export type LoginTestResult = {
  testCaseId: string;
  passed: boolean;
  httpStatus: number;
  message: string;
  responseBodySnippet?: string;
};

const nonExistentEmail =
  credentials.invalidEmail || 'no-user-login-test@invalid.example.com';

function snippet(text: string, max = 500): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

async function readBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hasInvalidCredentialsShape(body: Record<string, unknown> | null): boolean {
  if (!body) return false;
  const codeOk =
    body.errorCode === undefined || String(body.errorCode) === '100';
  const msgOk =
    body.message === undefined ||
    /invalid credentials/i.test(String(body.message));
  return codeOk && msgOk;
}

const CLIENT_ERROR = [400, 401, 422];
const METHOD_NOT_ALLOWED = [401, 404, 405];

function successShape(body: Record<string, unknown> | null): boolean {
  if (!body) return false;
  return (
    typeof body.refresh === 'string' &&
    !!body.refresh &&
    typeof body.access === 'string' &&
    !!body.access &&
    typeof body.user_id === 'number' &&
    typeof body.nick_name === 'string' &&
    typeof body.email === 'string' &&
    typeof body.role === 'number'
  );
}

function result(
  testCaseId: string,
  passed: boolean,
  httpStatus: number,
  message: string,
  responseBodySnippet?: string
): LoginTestResult {
  return { testCaseId, passed, httpStatus, message, responseBodySnippet };
}

export async function runLoginTestCase(testCaseId: string): Promise<LoginTestResult> {
  if (!LOGIN_TEST_CASE_IDS.includes(testCaseId as LoginTestCaseId)) {
    return result(
      testCaseId,
      false,
      0,
      `Unknown test case id. Use one of: ${LOGIN_TEST_CASE_IDS.join(', ')}`
    );
  }

  const id = testCaseId as LoginTestCaseId;

  if (id === 'API_TC_021') {
    return result(
      id,
      false,
      0,
      'Not feasible for automation: requires account lockout state (HTTP 429 / errorCode 104).'
    );
  }

  const postJson = async (body: unknown, hdrs = headers()) => {
    const res = await loginFetch(loginUrl, {
      method: 'POST',
      headers: hdrs,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    const text = await readBody(res);
    return { res, text, body: parseJson(text) };
  };

  if (id === 'API_TC_001') {
    const { res, text, body } = await postJson({
      email: credentials.validEmail,
      password: credentials.validPassword,
    });
    const passed = res.status === 200 && successShape(body);
    return result(
      id,
      passed,
      res.status,
      passed
        ? 'HTTP 200 with refresh, access, user_id, nick_name, email, and role.'
        : 'Expected HTTP 200 with documented success fields.',
      snippet(text)
    );
  }

  if (id === 'API_TC_002') {
    const { res, text } = await postJson({ password: 'x' });
    const passed = [400, 422].includes(res.status);
    return result(
      id,
      passed,
      res.status,
      passed ? 'HTTP 400 or 422 as expected.' : 'Expected HTTP 400 or 422.',
      snippet(text)
    );
  }

  if (id === 'API_TC_003') {
    const { res, text } = await postJson({ email: null, password: 'x' });
    const passed = [400, 422].includes(res.status);
    return result(id, passed, res.status, passed ? 'HTTP 400 or 422.' : 'Expected HTTP 400 or 422.', snippet(text));
  }

  if (id === 'API_TC_004') {
    const { res, text } = await postJson({ email: '', password: 'x' });
    const passed = [400, 422].includes(res.status);
    return result(id, passed, res.status, passed ? 'HTTP 400 or 422.' : 'Expected HTTP 400 or 422.', snippet(text));
  }

  if (id === 'API_TC_005') {
    const { res, text } = await postJson({ email: 12345, password: 'x' });
    const passed = CLIENT_ERROR.includes(res.status);
    return result(id, passed, res.status, passed ? 'Client error status as expected.' : 'Expected HTTP 400, 401, or 422.', snippet(text));
  }

  if (id === 'API_TC_006') {
    const { res, text } = await postJson({ email: 'not-an-email', password: 'x' });
    const passed = CLIENT_ERROR.includes(res.status);
    return result(id, passed, res.status, passed ? 'Client error status as expected.' : 'Expected HTTP 400, 401, or 422.', snippet(text));
  }

  if (id === 'API_TC_007') {
    const { res, text, body } = await postJson({
      email: nonExistentEmail,
      password: 'AnyPassword@1',
    });
    const passed = res.status === 401 && hasInvalidCredentialsShape(body);
    return result(
      id,
      passed,
      res.status,
      passed ? 'HTTP 401 with errorCode 100 / Invalid credentials.' : 'Expected HTTP 401 with documented error body.',
      snippet(text)
    );
  }

  if (id === 'API_TC_008') {
    const { res, text } = await postJson({ email: credentials.validEmail });
    const passed = CLIENT_ERROR.includes(res.status);
    return result(id, passed, res.status, passed ? 'Client error status as expected.' : 'Expected HTTP 400, 401, or 422.', snippet(text));
  }

  if (id === 'API_TC_009') {
    const { res, text } = await postJson({ email: credentials.validEmail, password: null });
    const passed = CLIENT_ERROR.includes(res.status);
    return result(id, passed, res.status, passed ? 'Client error status as expected.' : 'Expected HTTP 400, 401, or 422.', snippet(text));
  }

  if (id === 'API_TC_010') {
    const { res, text } = await postJson({ email: credentials.validEmail, password: '' });
    const passed = CLIENT_ERROR.includes(res.status);
    return result(id, passed, res.status, passed ? 'Client error status as expected.' : 'Expected HTTP 400, 401, or 422.', snippet(text));
  }

  if (id === 'API_TC_011') {
    const { res, text } = await postJson({ email: credentials.validEmail, password: 12345 });
    const passed = CLIENT_ERROR.includes(res.status);
    return result(id, passed, res.status, passed ? 'Client error status as expected.' : 'Expected HTTP 400, 401, or 422.', snippet(text));
  }

  if (id === 'API_TC_012') {
    const { res, text, body } = await postJson({
      email: credentials.validEmail,
      password: credentials.invalidPassword,
    });
    const passed = res.status === 401 && hasInvalidCredentialsShape(body);
    return result(
      id,
      passed,
      res.status,
      passed ? 'HTTP 401 with errorCode 100 / Invalid credentials.' : 'Expected HTTP 401 with documented error body.',
      snippet(text)
    );
  }

  if (id === 'API_TC_013') {
    const res = await loginFetch(loginUrl, { method: 'POST', headers: headers(), body: '' });
    const text = await readBody(res);
    const passed = [400, 422, 500].includes(res.status);
    return result(id, passed, res.status, passed ? 'Error status for empty body.' : 'Expected HTTP 400, 422, or 500.', snippet(text));
  }

  if (id === 'API_TC_014') {
    const { res, text } = await postJson('{invalid');
    const passed = [400, 500].includes(res.status);
    return result(id, passed, res.status, passed ? 'Error status for malformed JSON.' : 'Expected HTTP 400 or 500.', snippet(text));
  }

  if (id === 'API_TC_015') {
    const { res, text } = await postJson({
      email: credentials.validEmail,
      password: credentials.validPassword,
      unexpected_field: 'value',
    });
    const passed = [200, 400].includes(res.status);
    return result(
      id,
      passed,
      res.status,
      passed ? 'HTTP 200 or 400 as acceptable for unexpected fields.' : 'Expected HTTP 200 or 400.',
      snippet(text)
    );
  }

  if (id === 'API_TC_016') {
    const res = await loginFetch(loginUrl, { method: 'GET', headers: headers() });
    const text = await readBody(res);
    const passed = METHOD_NOT_ALLOWED.includes(res.status);
    return result(id, passed, res.status, passed ? 'Error status for GET.' : 'Expected HTTP 401, 404, or 405.', snippet(text));
  }

  if (id === 'API_TC_017') {
    const res = await loginFetch(loginUrl, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({
        email: credentials.validEmail,
        password: credentials.validPassword,
      }),
    });
    const text = await readBody(res);
    const passed = [404, 405].includes(res.status);
    return result(id, passed, res.status, passed ? 'HTTP 404 or 405 for PUT.' : 'Expected HTTP 404 or 405.', snippet(text));
  }

  if (id === 'API_TC_018') {
    const res = await loginFetch(loginUrl, { method: 'DELETE', headers: headers() });
    const text = await readBody(res);
    const passed = METHOD_NOT_ALLOWED.includes(res.status);
    return result(id, passed, res.status, passed ? 'Error status for DELETE.' : 'Expected HTTP 401, 404, or 405.', snippet(text));
  }

  if (id === 'API_TC_019') {
    const res = await loginFetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Accept: 'application/json' },
      body: JSON.stringify({
        email: credentials.validEmail,
        password: credentials.validPassword,
      }),
    });
    const text = await readBody(res);
    const passed = [400, 415].includes(res.status);
    return result(
      id,
      passed,
      res.status,
      passed ? 'HTTP 400 or 415 for non-JSON Content-Type.' : 'Expected HTTP 400 or 415.',
      snippet(text)
    );
  }

  // API_TC_020
  const res = await loginFetch(loginUrl, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: JSON.stringify({
      email: credentials.validEmail,
      password: credentials.validPassword,
    }),
  });
  const text = await readBody(res);
  const passed = [200, 400, 415].includes(res.status);
  return result(
    id,
    passed,
    res.status,
    passed ? 'HTTP 200, 400, or 415 when Content-Type is omitted.' : 'Expected HTTP 200, 400, or 415.',
    snippet(text)
  );
}

export async function runAllLoginTestCases(): Promise<{
  summary: { total: number; passed: number; failed: number; skipped: number };
  results: LoginTestResult[];
}> {
  const results: LoginTestResult[] = [];
  for (const id of LOGIN_AUTOMATABLE_IDS) {
    results.push(await runLoginTestCase(id));
  }
  const passed = results.filter((r) => r.passed).length;
  return {
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
      skipped: 1,
    },
    results,
  };
}
