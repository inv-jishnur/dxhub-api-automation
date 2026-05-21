import { serviceId } from './config';
import { type UniqueFieldRule, withUniqueFields } from './unique-fields';

export const validDiscountBody = {
  code: 'SIM50',
  name: 'Sim Welcome Discount',
  service_id: serviceId,
  coupon_type: 1,
  discount_mode: 1,
  value: 10,
  status: 1,
  start_date: '2026-04-01',
  end_date: '2026-04-01',
} as const;

export const discountUniqueFieldRules: readonly UniqueFieldRule[] = [
  { key: 'code', toUnique: (_base, suffix) => `DC${suffix}`.slice(0, 50) },
  { key: 'name', toUnique: (base, suffix) => (base + suffix).slice(0, 250) },
];

export function withUniqueDiscountFields<T extends Record<string, unknown>>(body: T): T {
  return withUniqueFields(body, discountUniqueFieldRules);
}

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
