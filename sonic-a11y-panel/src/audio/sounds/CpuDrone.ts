import { SoundSource } from '../SoundSource';
import { Glide } from '../effects/Glide';
import { Distortion } from '../effects/Distortion';
import { DefaultEQ } from '../effects/DefaultEQ';
import { LFO } from '../effects/LFO';

const LPF_MIN_FREQ = 300;
const LPF_MAX_FREQ = 15000;
const CHORD_FREQS = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0]; // C major, C3–G4
const CHORD_GAINS = [1.0, 0.7, 0.9, 0.6, 0.4, 0.5];
const LFO_MIN_RATE = 0.05;
const LFO_MAX_RATE = 6.0;
const LFO_DEPTH = 0.2;
const LFO_CRITICAL_DEPTH = 0.5;
const LFO_CRITICAL_THRESHOLD = 0.81; // ~90% raw CPU after Stevens' power law
const LIGHT_DISTORTION = 3.0;
const MAX_DISTORTION = 8.0;
const DISTORTION_ELEVATED = 0.60;
const DISTORTION_CRITICAL = 0.85;
const GLIDE_DURATION = 2.0;

function metricToFilterCutoff(value: number): number {
  return LPF_MIN_FREQ * Math.pow(LPF_MAX_FREQ / LPF_MIN_FREQ, value);
}

/**
 * CPU sound source — sawtooth chord with metric-driven brightness.
 *
 * Chain: oscillators → chordMix → distortion → EQ → LPF → destination
 * LFO: sine, rate driven by metric (0.05–6 Hz), near-silent at idle
 * Distortion: two-stage — light (60–85%), heavy (85–100%)
 */
export class CpuDrone implements SoundSource {
  private ctx: AudioContext | null = null;
  private readonly glide = new Glide(GLIDE_DURATION);
  private oscillators: OscillatorNode[] = [];
  private lfo: LFO | null = null;
  private lpf: BiquadFilterNode | null = null;
  private distortion: Distortion | null = null;
  private outputGain: GainNode | null = null;

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

    const outputGain = ctx.createGain();
    outputGain.gain.value = 0;
    this.outputGain = outputGain;

    chordMix.connect(distortion.node);
    distortion.node.connect(eq.input);
    eq.output.connect(lpf);
    lpf.connect(outputGain);
    outputGain.connect(destination);

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

  // 5% raw CPU after Stevens' power law = (5/100)^2 = 0.0025
  private static readonly FADE_IN_THRESHOLD = 0.0025;
  // Makeup attenuation applied at peak distortion drive to compensate for
  // tanh saturation's loudness boost — keeps perceived level comparable
  // while preserving the added brightness/harmonics.
  private static readonly DISTORTION_MAKEUP_MIN = 0.5;

  update(value: number): void {
    if (!this.ctx) {
      return;
    }

    // 0% = off, 0-5% fades in, 5%+ = full, with makeup attenuation under heavy distortion
    if (this.outputGain) {
      let vol: number;
      if (value <= 0) {
        vol = 0;
      } else if (value < CpuDrone.FADE_IN_THRESHOLD) {
        vol = value / CpuDrone.FADE_IN_THRESHOLD;
      } else {
        vol = 1;
      }
      if (value >= DISTORTION_CRITICAL) {
        const t = (value - DISTORTION_CRITICAL) / (1 - DISTORTION_CRITICAL);
        vol *= 1 - t * (1 - CpuDrone.DISTORTION_MAKEUP_MIN);
      }
      this.outputGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }

    if (this.lpf) {
      this.glide.apply(this.lpf.frequency, metricToFilterCutoff(value), this.ctx);
    }

    const lfoRate = LFO_MIN_RATE * Math.pow(LFO_MAX_RATE / LFO_MIN_RATE, value);
    this.lfo?.setRate(lfoRate);

    // Ramp LFO depth above 90% CPU for increased saliency
    if (value >= LFO_CRITICAL_THRESHOLD) {
      const t = (value - LFO_CRITICAL_THRESHOLD) / (1 - LFO_CRITICAL_THRESHOLD);
      this.lfo?.setDepth(LFO_DEPTH + t * (LFO_CRITICAL_DEPTH - LFO_DEPTH));
    } else {
      this.lfo?.setDepth(LFO_DEPTH);
    }

    if (value >= DISTORTION_CRITICAL) {
      // 85–100%: heavy distortion (3–8 drive)
      const t = (value - DISTORTION_CRITICAL) / (1 - DISTORTION_CRITICAL);
      this.distortion?.setDrive(LIGHT_DISTORTION + t * (MAX_DISTORTION - LIGHT_DISTORTION));
    } else if (value >= DISTORTION_ELEVATED) {
      // 60–85%: light distortion (0–3 drive)
      const t = (value - DISTORTION_ELEVATED) / (DISTORTION_CRITICAL - DISTORTION_ELEVATED);
      this.distortion?.setDrive(t * LIGHT_DISTORTION);
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
    this.outputGain = null;
    this.ctx = null;
  }
}
