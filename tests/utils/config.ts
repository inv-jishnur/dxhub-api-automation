import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const baseURL = (process.env.BASE_URL?.trim() || '').replace(/\/$/, '');

/** Host for login and provider plan list. Override with AUTH_API_BASE_URL in .env. */
export const authApiBaseURL = (
  process.env.AUTH_API_BASE_URL?.trim() ||
  'https://dxhub-dev-api.innovaturelabs.net/api/v1'
).replace(/\/$/, '');

export const loginEndpoint = process.env.LOGIN_ENDPOINT ?? '/login';
export const loginUrl = (
  process.env.LOGIN_URL?.trim() ||
  `${authApiBaseURL}${loginEndpoint.startsWith('/') ? '' : '/'}${loginEndpoint}`
).replace(/\/$/, '');

export const planProvidersPath = process.env.PLAN_PROVIDERS_PATH ?? '/plan/providers';
export const planProvidersUrl = `${authApiBaseURL}${planProvidersPath.startsWith('/') ? '' : '/'}${planProvidersPath}`;

/** Console API: create plan collection */
export const planProviderCollectionUrl = `${baseURL}/plan/provider`;

export const providerId = Number(process.env.PROVIDER_ID ?? '9');

export const serviceId = Number(process.env.SERVICE_ID ?? '1');

/** Console API: POST /api/v1/discount */
export const discountUrl = `${baseURL}/discount`;

export const credentials = {
  validEmail: process.env.VALID_EMAIL ?? '',
  validPassword: process.env.VALID_PASSWORD ?? '',
  invalidEmail: process.env.INVALID_EMAIL ?? '',
  invalidPassword: process.env.INVALID_PASSWORD ?? '',
};

/**
 * Shared JSON headers. With `accessToken`, sends `Authorization: <AUTH_PREFIX> <token>`.
 */
export function headers(accessToken?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (accessToken) {
    const prefix = (process.env.AUTH_PREFIX ?? 'DXHUB').trim();
    h.Authorization = `${prefix} ${accessToken}`.replace(/\s+/g, ' ');
  }
  return h;
}
