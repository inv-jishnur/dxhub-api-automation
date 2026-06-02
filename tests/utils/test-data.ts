/** Shared labels — `<MeaningfulText>_<timestamp>` pattern for readable automation data. */

export function testTimestamp(): string {
  return String(Date.now());
}

/** Build `MeaningfulLabel_timestamp` (sanitized, no spaces). */
export function meaningfulTestValue(label: string, timestamp: string = testTimestamp()): string {
  const clean = label.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_@-]/g, '');
  return `${clean}_${timestamp}`;
}

/**
 * Exact-length string with a meaningful prefix; extends with `_Label` segments or `_` padding.
 * Avoids meaningless filler like repeated `A` characters.
 */
export function meaningfulValueAtExactLength(
  length: number,
  label: string,
  timestamp: string = testTimestamp()
): string {
  const cleanLabel = label.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_@-]/g, '');
  let value = `${cleanLabel}_${timestamp}`;
  if (value.length >= length) return value.slice(0, length);

  const extension = `_${cleanLabel}`;
  while (value.length + extension.length <= length) {
    value += extension;
  }
  if (value.length < length) {
    value += '_'.repeat(length - value.length);
  }
  return value.slice(0, length);
}

/** Scenario labels for plan API test data. */
export const PlanDataLabels = {
  validName: 'ValidPlanName',
  validCode: 'ValidPlanCode',
  validDescription: 'ValidPlanDescription',
  maxLengthName: 'MaxLengthValidationPlanName',
  maxLengthCode: 'MaxLengthValidationPlanCode',
  maxLengthDescription: 'MaxLengthValidationDescription',
  exceedMaxLengthName: 'ExceedMaxLengthValidationPlanName',
  exceedMaxLengthCode: 'ExceedMaxLengthValidationPlanCode',
  exceedMaxLengthDescription: 'ExceedMaxLengthValidationDescription',
  fullUpdateName: 'FullUpdatePlanName',
  updatedName: 'UpdatedPlanName',
} as const;

/** Scenario labels for discount API test data. */
export const DiscountDataLabels = {
  validCode: 'ValidDiscountCode',
  validName: 'ValidDiscountName',
  duplicateCode: 'DuplicateValidationCode',
  duplicateAttemptName: 'DuplicateValidationAttemptName',
} as const;

/** Normalize legacy placeholder bases to meaningful labels before uniquify. */
export function normalizeDataLabel(base: string, fallback: string): string {
  const legacy: Record<string, string> = {
    VALID_CODE: PlanDataLabels.validCode,
    ValidPlanName: PlanDataLabels.validName,
    'Valid description': PlanDataLabels.validDescription,
    SIM50: DiscountDataLabels.validCode,
    'Sim Welcome Discount': DiscountDataLabels.validName,
    FullUpdate: PlanDataLabels.fullUpdateName,
  };
  return legacy[base] ?? (base.trim() || fallback);
}

/** Exact-length value; second argument must be a meaningful scenario label. */
export function stringAtExactLength(
  length: number,
  label: string,
  timestamp: string = testTimestamp()
): string {
  return meaningfulValueAtExactLength(length, label, timestamp);
}
