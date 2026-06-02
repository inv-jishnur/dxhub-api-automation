import type { APIResponse } from '@playwright/test';
import { planProviderCollectionUrl, providerId } from './config';
import {
  meaningfulTestValue,
  meaningfulValueAtExactLength,
  PlanDataLabels,
  testTimestamp,
} from './test-data';
import { meaningfulUniqueField, withUniqueFields } from './unique-fields';

export {
  meaningfulTestValue,
  meaningfulValueAtExactLength,
  PlanDataLabels,
  stringAtExactLength,
  testTimestamp,
} from './test-data';

export const validPlanBody = {
  provider: providerId,
  plan_name: PlanDataLabels.validName,
  plan_code: PlanDataLabels.validCode,
  type: 1,
  plan_type: 1,
  billing_type: 1,
  description: 'Valid plan description for automation testing',
} as const;

/** Plan API fields uniquified on each call; explicit `null` and over-max strings are preserved. */
export const planUniqueFieldRules = [
  meaningfulUniqueField('plan_name', PlanDataLabels.validName, 250),
  meaningfulUniqueField('plan_code', PlanDataLabels.validCode, 100),
] as const;

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

const maxLengthFieldLabels = {
  plan_name: PlanDataLabels.maxLengthName,
  plan_code: PlanDataLabels.maxLengthCode,
  description: PlanDataLabels.maxLengthDescription,
} as const;

const exceedMaxLengthFieldLabels = {
  plan_name: PlanDataLabels.exceedMaxLengthName,
  plan_code: PlanDataLabels.exceedMaxLengthCode,
  description: PlanDataLabels.exceedMaxLengthDescription,
} as const;

/**
 * Payload for boundary success tests: exact max lengths with meaningful unique text.
 */
export function buildPlanBodyAtMaxLength(
  field: 'plan_name' | 'plan_code' | 'description',
  maxLen: number
): Record<string, unknown> {
  const timestamp = testTimestamp();
  const atMax = (label: string) => meaningfulValueAtExactLength(maxLen, label, timestamp);
  const base: Record<string, unknown> = {
    provider: providerId,
    plan_name: atMax(PlanDataLabels.maxLengthName),
    plan_code: atMax(PlanDataLabels.maxLengthCode),
    type: 1,
    plan_type: 1,
    billing_type: 1,
    description: meaningfulTestValue(PlanDataLabels.validDescription, timestamp),
  };
  base[field] = atMax(maxLengthFieldLabels[field]);
  return base;
}

/**
 * Payload for over-max negative tests: meaningful text at max+1 length; other identifiers stay unique.
 */
export function buildPlanBodyOverMaxLength(
  field: 'plan_name' | 'plan_code' | 'description',
  maxLen: number
): Record<string, unknown> {
  const timestamp = testTimestamp();
  const base = buildPlanBody();
  base[field] = meaningfulValueAtExactLength(
    maxLen + 1,
    exceedMaxLengthFieldLabels[field],
    timestamp
  );
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
