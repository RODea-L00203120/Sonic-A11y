/**
 * Reusable LFO effect — modulates an AudioParam.
 *
 * Configurable waveform, rate range, and depth. The rate can be
 * updated live via setRate() for metric-driven modulation speed.
 */
export class LFO {
  private readonly oscillator: OscillatorNode;
  private readonly gainNode: GainNode;

  constructor(
    ctx: AudioContext,
    options: {
      type?: OscillatorType;
      rate?: number;
      depth?: number;
    } = {}
  ) {
    const { type = 'sine', rate = 1.0, depth = 0.1 } = options;

    this.oscillator = ctx.createOscillator();
    this.oscillator.type = type;
    this.oscillator.frequency.value = rate;

    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = depth;

    this.oscillator.connect(this.gainNode);
  }

  /** Connect the LFO output to the target AudioParam. */
  connect(target: AudioParam): void {
    this.gainNode.connect(target);
  }

  /** Start the LFO. Call once after construction. */
  start(): void {
    this.oscillator.start();
  }

  /** Set the LFO rate in Hz. */
  setRate(rate: number): void {
    this.oscillator.frequency.value = rate;
  }

  /** Set the modulation depth. */
  setDepth(depth: number): void {
    this.gainNode.gain.value = depth;
  }

  /** Set the waveform shape. */
  setType(type: OscillatorType): void {
    this.oscillator.type = type;
  }

  stop(): void {
    this.oscillator.stop();
    this.oscillator.disconnect();
    this.gainNode.disconnect();
  }
}
