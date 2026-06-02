import { serviceId } from './config';
import { DiscountDataLabels, meaningfulTestValue, testTimestamp } from './test-data';
import { meaningfulUniqueField, withUniqueFields } from './unique-fields';

export const validDiscountBody = {
  code: DiscountDataLabels.validCode,
  name: DiscountDataLabels.validName,
  service_id: serviceId,
  coupon_type: 1,
  discount_mode: 1,
  value: 10,
  status: 1,
  start_date: '2026-04-01',
  end_date: '2026-04-01',
} as const;

export const discountUniqueFieldRules = [
  meaningfulUniqueField('code', DiscountDataLabels.validCode, 50),
  meaningfulUniqueField('name', DiscountDataLabels.validName, 250),
] as const;

export function withUniqueDiscountFields<T extends Record<string, unknown>>(body: T): T {
  return withUniqueFields(body, discountUniqueFieldRules);
}

/**
 * Build a Create Discount payload with meaningful unique code/name.
 * Use `omitKeys` for missing-field tests; use overrides for null/invalid/boundary values.
 */
export function buildDiscountBody(
  overrides: Record<string, unknown> = {},
  omitKeys: string[] = []
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    ...validDiscountBody,
    ...discountDateRange(),
    ...overrides,
  };
  for (const key of omitKeys) {
    delete body[key];
  }
  return withUniqueDiscountFields(body);
}

/** Fixed code for intentional duplicate-validation tests (no timestamp — same code twice). */
export const DUPLICATE_VALIDATION_CODE = DiscountDataLabels.duplicateCode;

/** ISO date YYYY-MM-DD for discount validity windows. */
export function discountDateRange(daysFromNow = 30, spanDays = 30): {
  start_date: string;
  end_date: string;
} {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  const end = new Date(start);
  end.setDate(end.getDate() + spanDays);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start_date: fmt(start), end_date: fmt(end) };
}

/** Meaningful name for the second request in duplicate-code validation. */
export function duplicateAttemptDiscountName(timestamp: string = testTimestamp()): string {
  return meaningfulTestValue(DiscountDataLabels.duplicateAttemptName, timestamp);
}
