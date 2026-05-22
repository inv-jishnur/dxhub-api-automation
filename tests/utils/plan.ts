import type { APIResponse } from '@playwright/test';
import { planProviderCollectionUrl, providerId } from './config';
import { type UniqueFieldRule, stringAtExactLength, withUniqueFields } from './unique-fields';

export { stringAtExactLength };

export const validPlanBody = {
  provider: providerId,
  plan_name: 'ValidPlanName',
  plan_code: 'VALID_CODE',
  type: 1,
  plan_type: 1,
  billing_type: 1,
  description: 'Valid description',
} as const;

/** Plan API fields uniquified on each call; explicit `null` and over-max strings are preserved. */
export const planUniqueFieldRules: readonly UniqueFieldRule[] = [
  {
    key: 'plan_name',
    maxLength: 250,
    toUnique: (base, suffix) => (base + suffix).slice(0, 250),
  },
  {
    key: 'plan_code',
    maxLength: 100,
    toUnique: (_base, suffix) => (`C${suffix}`).slice(0, 100),
  },
];

/** Avoid duplicate plan_code / plan_name collisions across runs. */
export function withUniquePlanFields<T extends Record<string, unknown>>(body: T): T {
  return withUniqueFields(body, planUniqueFieldRules);
}

/**
 * Build a Create Plan payload with unique plan_name/plan_code.
 * Use `omitKeys` for missing-field tests; use overrides for null/invalid/boundary values.
 */
export function buildPlanBody(
  overrides: Record<string, unknown> = {},
  omitKeys: string[] = []
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...validPlanBody, ...overrides };
  for (const key of omitKeys) {
    delete body[key];
  }
  return withUniquePlanFields(body);
}

/**
 * Payload for boundary success tests: exact max lengths with unique suffixes (no duplicate collisions).
 */
export function buildPlanBodyAtMaxLength(
  field: 'plan_name' | 'plan_code' | 'description',
  maxLen: number
): Record<string, unknown> {
  const suffix = String(Date.now());
  const unique = (prefix: string) => stringAtExactLength(maxLen, `${prefix}${suffix}`);
  const base: Record<string, unknown> = {
    provider: providerId,
    plan_name: unique('N'),
    plan_code: unique('C'),
    type: 1,
    plan_type: 1,
    billing_type: 1,
    description: 'Valid description',
  };
  if (field === 'plan_name') base.plan_name = unique('N');
  if (field === 'plan_code') base.plan_code = unique('C');
  if (field === 'description') base.description = unique('D');
  return base;
}

/**
 * Payload for over-max negative tests: string length is max+1 and other identifiers stay unique.
 */
export function buildPlanBodyOverMaxLength(
  field: 'plan_name' | 'plan_code' | 'description',
  maxLen: number
): Record<string, unknown> {
  const suffix = String(Date.now());
  const base = buildPlanBody();
  base[field] = stringAtExactLength(maxLen + 1, suffix);
  return base;
}

export function planProviderItemUrl(planId: string): string {
  return `${planProviderCollectionUrl.replace(/\/$/, '')}/${planId}`;
}

export async function readCreatedPlanId(res: APIResponse): Promise<string> {
  const body = (await res.json()) as Record<string, unknown>;
  const id =
    body.id ??
    (typeof body.data === 'object' && body.data !== null
      ? (body.data as Record<string, unknown>).id
      : undefined) ??
    body.pk;
  if (id === undefined || id === null) {
    throw new Error(`Could not parse plan id from create response: ${JSON.stringify(body)}`);
  }
  return String(id);
}
