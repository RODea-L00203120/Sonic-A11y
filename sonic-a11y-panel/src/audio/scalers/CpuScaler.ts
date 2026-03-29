/**
 * Perceptual scaler for CPU utilisation (0–100%).
 *
 * Applies Stevens' Power Law with exponent 2.0 to compress the
 * idle range and expand the critical range:
 *
 *   10% → 0.01 | 50% → 0.25 | 70% → 0.49 | 90% → 0.81 | 100% → 1.0
 *
 * CPU operational semantics: 0–50% is routine headroom, 70%+ is
 * elevated, 90%+ is critical. The power curve reflects this by
 * allocating most of the sonification parameter space to the
 * operationally significant upper range.
 */
const EXPONENT = 2.0;

export function scaleCpu(rawPercent: number): number {
  const clamped = Math.max(0, Math.min(100, rawPercent));
  return Math.pow(clamped / 100, EXPONENT);
}
