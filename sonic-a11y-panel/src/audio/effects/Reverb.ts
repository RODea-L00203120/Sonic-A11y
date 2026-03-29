/**
 * Algorithmic convolution reverb — dark hall style.
 *
 * Generates an impulse response at construction time: exponentially
 * decaying filtered noise. The dry/wet mix is controllable via setMix().
 *
 * Signal flow: input → dry gain ──────────────┐
 *              input → convolver → wet gain ───┼→ output
 */
export class Reverb {
  /** Connect source signal here. */
  readonly input: GainNode;
  /** Connect this to the next stage. */
  readonly output: GainNode;

  private readonly dryGain: GainNode;
  private readonly wetGain: GainNode;

  constructor(ctx: AudioContext, duration = 3.0, decay = 2.5) {
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();

    // Default: mostly dry
    this.dryGain.gain.value = 1.0;
    this.wetGain.gain.value = 0.0;

    const convolver = ctx.createConvolver();
    convolver.buffer = this.buildImpulse(ctx, duration, decay);

    // Dark hall: roll off highs from the reverb tail
    const dampening = ctx.createBiquadFilter();
    dampening.type = 'lowpass';
    dampening.frequency.value = 2000;
    dampening.Q.value = 0.5;

    // Dry path
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // Wet path: input → convolver → dampening → wet gain → output
    this.input.connect(convolver);
    convolver.connect(dampening);
    dampening.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }

  /** Set dry/wet mix (0 = fully dry, 1 = fully wet). */
  setMix(value: number): void {
    this.dryGain.gain.value = 1 - value;
    this.wetGain.gain.value = value;
  }

  private buildImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // White noise with exponential decay
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    return buffer;
  }
}
