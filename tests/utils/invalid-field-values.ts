/**
 * Invalid inputs for negative integer/number datatype tests.
 *
 * Do NOT use numeric strings (e.g. "1", "9", "10") — many backends coerce them to valid integers.
 * Use values that cannot be auto-converted: symbols, booleans, arrays, objects, or null (separate TC).
 */
export const INVALID_INT_VALUE = '@';

export const invalidIntegerInputs = {
  symbol: '@',
  boolean: true as unknown as number,
  array: [] as unknown as number,
  object: {} as unknown as number,
} as const;
