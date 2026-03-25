import { SoundSource } from '../SoundSource';
import { Glide } from '../effects/Glide';
import { Distortion } from '../effects/Distortion';
import { DefaultEQ } from '../effects/DefaultEQ';
import { LFO } from '../effects/LFO';

const LPF_MIN_FREQ = 300;
const LPF_MAX_FREQ = 15000;
const CHORD_FREQS = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0]; // C major, C3–G4
const CHORD_GAINS = [1.0, 0.7, 0.9, 0.6, 0.4, 0.5];
const LFO_MIN_RATE = 0.3;
const LFO_MAX_RATE = 6.0;
const LFO_DEPTH = 0.1;
const MAX_DISTORTION = 8.0;
const DISTORTION_THRESHOLD = 0.81;
const GLIDE_DURATION = 3.0;

function metricToFilterCutoff(value: number): number {
  return LPF_MIN_FREQ * Math.pow(LPF_MAX_FREQ / LPF_MIN_FREQ, value);
}

/**
 * CPU sound source — sawtooth chord with metric-driven brightness.
 *
 * Chain: oscillators → chordMix → distortion → EQ → LPF → destination
 * LFO: sine, rate driven by metric (0.3–6 Hz)
 * Distortion: kicks in above 90% CPU only
 */
export class CpuDrone implements SoundSource {
  private ctx: AudioContext | null = null;
  private readonly glide = new Glide(GLIDE_DURATION);
  private oscillators: OscillatorNode[] = [];
  private lfo: LFO | null = null;
  private lpf: BiquadFilterNode | null = null;
  private distortion: Distortion | null = null;

  start(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;

    const eq = new DefaultEQ(ctx);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = LPF_MIN_FREQ;
    lpf.Q.value = 1.5;
    this.lpf = lpf;

    const distortion = new Distortion(ctx);
    this.distortion = distortion;

    const lfo = new LFO(ctx, {
      type: 'sine',
      rate: LFO_MIN_RATE,
      depth: LFO_DEPTH,
    });
    this.lfo = lfo;

    const chordMix = ctx.createGain();
    chordMix.gain.value = 1.0;
    lfo.connect(chordMix.gain);
    lfo.start();

    chordMix.connect(distortion.node);
    distortion.node.connect(eq.input);
    eq.output.connect(lpf);
    lpf.connect(destination);

    this.oscillators = CHORD_FREQS.map((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      oscGain.gain.value = CHORD_GAINS[i] / CHORD_FREQS.length;
      osc.connect(oscGain);
      oscGain.connect(chordMix);
      osc.start();
      return osc;
    });
  }

  update(value: number): void {
    if (!this.ctx) {
      return;
    }

    if (this.lpf) {
      this.glide.apply(this.lpf.frequency, metricToFilterCutoff(value), this.ctx);
    }

    const lfoRate = LFO_MIN_RATE * Math.pow(LFO_MAX_RATE / LFO_MIN_RATE, value);
    this.lfo?.setRate(lfoRate);

    if (value >= DISTORTION_THRESHOLD) {
      const t = (value - DISTORTION_THRESHOLD) / (1 - DISTORTION_THRESHOLD);
      this.distortion?.setDrive(t * MAX_DISTORTION);
    } else {
      this.distortion?.setDrive(0);
    }
  }

  stop(): void {
    this.oscillators.forEach((osc) => {
      osc.stop();
      osc.disconnect();
    });
    this.lfo?.stop();
    this.oscillators = [];
    this.lfo = null;
    this.lpf = null;
    this.distortion = null;
    this.ctx = null;
  }
}
