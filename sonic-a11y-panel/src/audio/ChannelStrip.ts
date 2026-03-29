/**
 * Per-metric channel strip: gain control + stereo panner.
 *
 * Each metric (CPU, RAM, errors) gets its own ChannelStrip.
 * Preset outputs connect to `input`, the strip's output
 * feeds into MasterChain.input.
 */
export class ChannelStrip {
  /** Connect preset output here. */
  readonly input: GainNode;

  private readonly panner: StereoPannerNode;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.input = ctx.createGain();
    this.panner = ctx.createStereoPanner();

    this.input.connect(this.panner);
    this.panner.connect(destination);
  }

  /** Set channel volume (0–1). */
  setVolume(value: number): void {
    this.input.gain.value = value;
  }

  /** Set stereo pan (-1 left, 0 centre, 1 right). */
  setPan(value: number): void {
    this.panner.pan.value = value;
  }

  /** Mute by setting gain to 0, unmute by restoring volume. */
  setMuted(muted: boolean, volume: number): void {
    this.input.gain.value = muted ? 0 : volume;
  }

  disconnect(): void {
    this.input.disconnect();
    this.panner.disconnect();
  }
}
