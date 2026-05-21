import type { APIResponse } from '@playwright/test';
import { planProviderCollectionUrl, providerId } from './config';
import { type UniqueFieldRule, withUniqueFields } from './unique-fields';

export const validPlanBody = {
  provider: providerId,
  plan_name: 'ValidPlanName',
  plan_code: 'VALID_CODE',
  type: 1,
  plan_type: 1,
  billing_type: 1,
  description: 'Valid description',
} as const;

/** Plan API fields uniquified on each call; explicit `null` values are preserved. */
export const planUniqueFieldRules: readonly UniqueFieldRule[] = [
  { key: 'plan_name', toUnique: (base, suffix) => (base + suffix).slice(0, 250) },
  { key: 'plan_code', toUnique: (_base, suffix) => (`C${suffix}`).slice(0, 100) },
];

/** Avoid duplicate plan_code / plan_name collisions across runs. */
export function withUniquePlanFields<T extends Record<string, unknown>>(body: T): T {
  return withUniqueFields(body, planUniqueFieldRules);
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
