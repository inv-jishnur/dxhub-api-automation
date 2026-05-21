export type UniqueFieldRule = {
  /** Request body key to uniquify (e.g. plan_name, plan_code, email). */
  key: string;
  /** Build the new value from the current string base and a run suffix. */
  toUnique: (base: string, suffix: string) => string;
};

/**
 * Copy `body` and uniquify configured fields to avoid collisions across test runs.
 * Fields set to `null`, `''`, or a non-string are never modified (negative validation tests).
 */
export function withUniqueFields<T extends Record<string, unknown>>(
  body: T,
  rules: readonly UniqueFieldRule[],
  suffix: string = String(Date.now())
): T {
  const out = { ...body } as Record<string, unknown>;

  for (const { key, toUnique } of rules) {
    if (!(key in out)) continue;
    if (out[key] === null || out[key] === '') continue;
    if (typeof out[key] !== 'string') continue;

    out[key] = toUnique(out[key] as string, suffix);
  }

  return out as T;
}
