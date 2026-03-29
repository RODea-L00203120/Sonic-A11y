/**
 * Perceptual scaler for RAM utilisation (0–100%).
 *
 * Applies Stevens' Power Law with exponent 2.0, matching the CPU
 * scaler. RAM has similar operational semantics: low usage is routine
 * headroom, high usage is critical.
 *
 *   10% → 0.01 | 50% → 0.25 | 70% → 0.49 | 90% → 0.81 | 100% → 1.0
 */
const EXPONENT = 2.0;

export function scaleRam(rawPercent: number): number {
  const clamped = Math.max(0, Math.min(100, rawPercent));
  return Math.pow(clamped / 100, EXPONENT);
}
