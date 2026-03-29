/**
 * Determines when error earcons should fire.
 *
 * Tracks cooldown between triggers to prevent rapid-fire.
 * Returns true when a trigger should occur, false otherwise.
 */
export class ErrorTrigger {
  private lastTriggerTime = 0;
  private readonly cooldown: number;

  /** @param cooldown — minimum seconds between triggers */
  constructor(cooldown = 1.0) {
    this.cooldown = cooldown;
  }

  /** Check if an earcon should fire given the current error value and audio time. */
  shouldFire(value: number, currentTime: number): boolean {
    if (value <= 0) {
      return false;
    }
    if (currentTime - this.lastTriggerTime < this.cooldown) {
      return false;
    }
    this.lastTriggerTime = currentTime;
    return true;
  }

  reset(): void {
    this.lastTriggerTime = 0;
  }
}
