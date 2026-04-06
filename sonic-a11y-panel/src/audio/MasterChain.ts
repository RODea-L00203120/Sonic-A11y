/**
 * Shared output chain: volume control → makeup gain → safety limiter → destination.
 *
 * Every preset connects into `input` — the rest of the chain
 * is transparent to the preset.
 */
export class MasterChain {
  readonly ctx: AudioContext;

  /** Connect presets here */
  readonly input: GainNode;

  private readonly volumeGain: GainNode;
  private readonly makeupGain: GainNode;
  private readonly limiter: DynamicsCompressorNode;

  private static readonly MAX_GAIN = 0.8;

  constructor() {
    this.ctx = new AudioContext();

    // Preset output feeds into this node
    this.input = this.ctx.createGain();
    this.input.gain.value = 1.0;

    // User-controlled volume (0–1 mapped to 0–MAX_GAIN)
    this.volumeGain = this.ctx.createGain();
    this.volumeGain.gain.value = 0.7;

    // Makeup gain applies MAX_GAIN ceiling
    this.makeupGain = this.ctx.createGain();
    this.makeupGain.gain.value = MasterChain.MAX_GAIN;

    // Brick-wall limiter: catches transients before they clip
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -3;   // dBFS — start limiting 3 dB below clipping
    this.limiter.knee.value = 0;         // hard knee — no soft transition
    this.limiter.ratio.value = 20;       // near-infinite ratio — brickwall
    this.limiter.attack.value = 0.001;   // 1 ms — catch transients fast
    this.limiter.release.value = 0.05;   // 50 ms — recover quickly

    // Chain: input → volume → makeup → limiter → speakers
    this.input.connect(this.volumeGain);
    this.volumeGain.connect(this.makeupGain);
    this.makeupGain.connect(this.limiter);
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
    this.makeupGain.disconnect();
    this.limiter.disconnect();
    this.ctx.close();
  }
}
