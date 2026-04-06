/**
 * Waveshaper distortion effect.
 *
 * Generates a tanh-based distortion curve and applies it to a WaveShaperNode.
 * Drive of 0 = clean (linear), higher values = grittier.
 */
export class Distortion {
  private readonly samples: number;
  readonly node: WaveShaperNode;

  constructor(ctx: AudioContext, samples = 256) {
    this.samples = samples;
    this.node = ctx.createWaveShaper();
    this.node.curve = this.makeCurve(0) as Float32Array<ArrayBuffer>;
    this.node.oversample = '4x';
  }

  /** Set the distortion drive (0 = clean, higher = grittier). */
  setDrive(drive: number): void {
    this.node.curve = this.makeCurve(drive) as Float32Array<ArrayBuffer>;
  }

  private makeCurve(drive: number): Float32Array {
    const curve = new Float32Array(this.samples);
    for (let i = 0; i < this.samples; i++) {
      const x = (i * 2) / this.samples - 1;
      curve[i] = drive === 0 ? x : Math.tanh(drive * x);
    }
    return curve;
  }
}
