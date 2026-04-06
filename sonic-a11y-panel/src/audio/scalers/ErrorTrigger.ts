/**
 * Determines when error earcons should fire.
 *
 * Tracks the cumulative error count from Prometheus. Fires once per
 * new error — only when the count increases from the previous poll.
 */
export class ErrorTrigger {
  private lastCount = -1;

  /** Check if an earcon should fire given the current cumulative error count. */
  shouldFire(value: number): boolean {
    const prev = this.lastCount;
    this.lastCount = value;

    // First reading — store baseline, don't fire
    if (prev < 0) {
      return false;
    }

    // Fire only when count has increased
    return value > prev;
  }

  reset(): void {
    this.lastCount = -1;
  }
}
