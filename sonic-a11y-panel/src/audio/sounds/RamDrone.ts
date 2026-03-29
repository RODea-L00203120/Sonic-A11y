import { SoundSource } from '../SoundSource';
import { Glide } from '../effects/Glide';
import { DefaultEQ } from '../effects/DefaultEQ';
import { Reverb } from '../effects/Reverb';

const BASE_FREQ = 246.94;      // B3 — diatonic seventh, mildly dissonant against C major triad
const HIGH_FREQ = 493.88;      // B4 — subtle pitch rise at critical utilisation
const LPF_MIN_FREQ = 300;
const LPF_MAX_FREQ = 8000;
const REVERB_MAX_MIX = 0.7;    // Spacious at idle
const REVERB_MIN_MIX = 0.05;   // Near-dry at critical
const GLIDE_DURATION = 2.0;

function metricToFilterCutoff(value: number): number {
  return LPF_MIN_FREQ * Math.pow(LPF_MAX_FREQ / LPF_MIN_FREQ, value);
}

/**
 * RAM sound source — sawtooth seventh with reverb-as-space metaphor.
 *
 * Chain: oscillator → EQ → LPF → reverb → destination
 *
 * Reverb: wet/spacious at low utilisation (headroom), dry at high (constricted).
 * Pitch: B3 rising toward B4 with utilisation.
 * Brightness: LPF cutoff tracks RAM% (warm at idle, bright at critical).
 */
export class RamDrone implements SoundSource {
  private ctx: AudioContext | null = null;
  private readonly glide = new Glide(GLIDE_DURATION);
  private oscillator: OscillatorNode | null = null;
  private lpf: BiquadFilterNode | null = null;
  private reverb: Reverb | null = null;
  private outputGain: GainNode | null = null;

  start(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;

    const eq = new DefaultEQ(ctx);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = LPF_MIN_FREQ;
    lpf.Q.value = 1.0;
    this.lpf = lpf;

    const reverb = new Reverb(ctx, 3.0, 2.0);
    reverb.setMix(REVERB_MAX_MIX);
    this.reverb = reverb;

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.3;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = BASE_FREQ;
    this.oscillator = osc;

    osc.connect(oscGain);
    oscGain.connect(eq.input);
    eq.output.connect(lpf);
    const outputGain = ctx.createGain();
    outputGain.gain.value = 0;
    this.outputGain = outputGain;

    lpf.connect(reverb.input);
    reverb.output.connect(outputGain);
    outputGain.connect(destination);

    osc.start();
  }

  // 5% raw RAM after Stevens' power law = (5/100)^2 = 0.0025
  private static readonly FADE_IN_THRESHOLD = 0.0025;

  update(value: number): void {
    if (!this.ctx) {
      return;
    }

    // 0% = off, 0-5% fades in, 5%+ = full
    if (this.outputGain) {
      let vol: number;
      if (value <= 0) {
        vol = 0;
      } else if (value < RamDrone.FADE_IN_THRESHOLD) {
        vol = value / RamDrone.FADE_IN_THRESHOLD;
      } else {
        vol = 1;
      }
      this.outputGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }

    // Brightness: LPF cutoff tracks RAM%
    if (this.lpf) {
      this.glide.apply(this.lpf.frequency, metricToFilterCutoff(value), this.ctx);
    }

    // Pitch: B3 → B4 subtle rise with utilisation
    if (this.oscillator) {
      const freq = BASE_FREQ + value * (HIGH_FREQ - BASE_FREQ);
      this.glide.apply(this.oscillator.frequency, freq, this.ctx);
    }

    // Reverb: spacious at idle, dry at critical (inverted mapping)
    if (this.reverb) {
      const mix = REVERB_MAX_MIX - value * (REVERB_MAX_MIX - REVERB_MIN_MIX);
      this.reverb.setMix(mix);
    }
  }

  stop(): void {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.reverb) {
      this.reverb.input.disconnect();
      this.reverb.output.disconnect();
      this.reverb = null;
    }
    this.lpf = null;
    this.outputGain = null;
    this.ctx = null;
  }
}
