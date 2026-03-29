/**
 * Smoothly transitions an AudioParam to a target value over a given duration.
 *
 * Uses the Web Audio `setTargetAtTime` exponential approach, where `timeConstant`
 * controls how quickly the param reaches the target (~95% after 3× the constant).
 */
export class Glide {
  private readonly timeConstant: number;

  /**
   * @param duration — perceptual glide duration in seconds.
   *   Internally converted to a time constant (duration / 3) so the
   *   param reaches ~95% of the target within the stated duration.
   */
  constructor(duration: number) {
    this.timeConstant = duration / 3;
  }

  /** Glide a single AudioParam toward `target`, starting now. */
  apply(param: AudioParam, target: number, ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Lock in the current value and cancel any in-progress automation
    // so the new glide starts from where the param actually is right now.
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.setTargetAtTime(target, now, this.timeConstant);
  }
}
