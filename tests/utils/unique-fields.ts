import {
  meaningfulTestValue,
  normalizeDataLabel,
  testTimestamp,
} from './test-data';

export type UniqueFieldRule = {
  /** Request body key to uniquify (e.g. plan_name, plan_code, email). */
  key: string;
  /** Build the new value from the current string base and a run suffix. */
  toUnique: (base: string, suffix: string) => string;
  /**
   * When the current string length is already greater than this limit, skip uniquify.
   * Keeps over-max negative payloads intact (e.g. plan_name with 251 characters).
   */
  maxLength?: number;
};

export {
  meaningfulTestValue,
  meaningfulValueAtExactLength,
  PlanDataLabels,
  DiscountDataLabels,
  stringAtExactLength,
  testTimestamp,
} from './test-data';

/**
 * Copy `body` and uniquify configured fields to avoid collisions across test runs.
 * Skips fields set to `null`, `''`, non-string values, or strings longer than `maxLength` (when set).
 */
export function withUniqueFields<T extends Record<string, unknown>>(
  body: T,
  rules: readonly UniqueFieldRule[],
  suffix: string = testTimestamp()
): T {
  const out = { ...body } as Record<string, unknown>;

  for (const { key, toUnique, maxLength } of rules) {
    if (!(key in out)) continue;
    if (out[key] === null || out[key] === '') continue;
    if (typeof out[key] !== 'string') continue;
    const current = out[key] as string;
    if (maxLength !== undefined && current.length > maxLength) continue;

    out[key] = toUnique(current, suffix);
  }

  return out as T;
}

/** Default uniquify: `MeaningfulLabel_timestamp`, truncated to maxLength when provided. */
export function meaningfulUniqueField(
  key: string,
  fallbackLabel: string,
  maxLength?: number
): UniqueFieldRule {
  return {
    key,
    maxLength,
    toUnique: (base, suffix) => {
      const value = meaningfulTestValue(normalizeDataLabel(base, fallbackLabel), suffix);
      return maxLength !== undefined ? value.slice(0, maxLength) : value;
    },
  };
}
