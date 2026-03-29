/**
 * Shared output chain: volume control → safety limiter → destination.
 *
 * Every preset connects into `input` — the rest of the chain
 * is transparent to the preset.
 */
export class MasterChain {
  readonly ctx: AudioContext;

  /** Connect presets here */
  readonly input: GainNode;

  private readonly volumeGain: GainNode;
  private readonly limiter: GainNode;

  private static readonly MAX_GAIN = 0.15;

  constructor() {
    this.ctx = new AudioContext();

    // Preset output feeds into this node
    this.input = this.ctx.createGain();
    this.input.gain.value = 1.0;

    // User-controlled volume (0–1)
    this.volumeGain = this.ctx.createGain();
    this.volumeGain.gain.value = 0.5;

    // Hard ceiling so nothing blows the speakers
    this.limiter = this.ctx.createGain();
    this.limiter.gain.value = MasterChain.MAX_GAIN;

    // Chain: input → volume → limiter → speakers
    this.input.connect(this.volumeGain);
    this.volumeGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
  }

  setVolume(value: number): void {
    this.volumeGain.gain.value = value;
  }

  /** Mute by disconnecting the limiter from speakers — guaranteed silence. */
  mute(): void {
    try { this.limiter.disconnect(this.ctx.destination); } catch { /* already disconnected */ }
  }

  /** Unmute by reconnecting the limiter to speakers. */
  unmute(): void {
    try { this.limiter.connect(this.ctx.destination); } catch { /* already connected */ }
  }

  destroy(): void {
    // Disconnect immediately so audio stops before the async close() completes
    this.input.disconnect();
    this.volumeGain.disconnect();
    this.limiter.disconnect();
    this.ctx.close();
  }
}
