import { SoundPreset } from '../SoundPreset';
import { Glide } from '../effects/Glide';
import { Distortion } from '../effects/Distortion';
import { SynthA11yEQ } from '../effects/SynthA11yEQ';

// --- Tuning constants ---

const GLIDE_DURATION = 3.0;

// LPF cutoff range
const LPF_MIN_FREQ = 300;
const LPF_MAX_FREQ = 15000;

// C major triad spread across two octaves (C3 E3 G3 C4 E4 G4)
const CHORD_FREQS = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0];
const CHORD_GAINS = [1.0, 0.7, 0.9, 0.6, 0.4, 0.5];

// LFO — slow wobble at low metric, agitated at high
const LFO_MIN_RATE = 0.3;
const LFO_MAX_RATE = 6.0;
const LFO_DEPTH = 0.1;

const MAX_DISTORTION = 8.0;

// --- Helpers ---

function metricToFilterCutoff(value: number): number {
  return LPF_MIN_FREQ * Math.pow(LPF_MAX_FREQ / LPF_MIN_FREQ, value);
}

/**
 * "Synth A11y" — sawtooth chord with metric-driven filter, LFO and distortion.
 *
 * Signal chain:
 *   oscillators → chordMix → waveshaper → HPF → notch → LPF → destination
 */
export class SynthA11y implements SoundPreset {
  readonly name = 'Synth A11y';

  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private lpf: BiquadFilterNode | null = null;
  private distortion: Distortion | null = null;
  private readonly glide = new Glide(GLIDE_DURATION);

  start(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;

    // --- Filters ---

    const eq = new SynthA11yEQ(ctx);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = LPF_MIN_FREQ;
    lpf.Q.value = 1.5;
    this.lpf = lpf;

    // --- Distortion ---

    const distortion = new Distortion(ctx);
    this.distortion = distortion;

    // --- LFO → chord amplitude ---

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = LFO_MIN_RATE;
    lfoGain.gain.value = LFO_DEPTH;
    this.lfo = lfo;

    const chordMix = ctx.createGain();
    chordMix.gain.value = 1.0;

    lfo.connect(lfoGain);
    lfoGain.connect(chordMix.gain);

    // --- Signal chain ---

    chordMix.connect(distortion.node);
    distortion.node.connect(eq.input);
    eq.output.connect(lpf);
    lpf.connect(destination);

    // --- Oscillators ---

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

    lfo.start();
  }

  update(value: number): void {
    if (!this.ctx) {
      return;
    }

    // LPF cutoff — muffled at idle, bright at load
    if (this.lpf) {
      this.glide.apply(this.lpf.frequency, metricToFilterCutoff(value), this.ctx);
    }

    // LFO rate — calm to agitated (exponential for perceptually uniform steps)
    const lfoRate = LFO_MIN_RATE * Math.pow(LFO_MAX_RATE / LFO_MIN_RATE, value);
    if (this.lfo) {
      this.glide.apply(this.lfo.frequency, lfoRate, this.ctx);
    }

    // Distortion — only kicks in above 90% CPU (0.81 after power curve in DataScaler)
    const DISTORTION_THRESHOLD = 0.81;
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
    this.lfo?.disconnect();
    this.oscillators = [];
    this.lfo = null;
    this.lpf = null;
    this.distortion = null;
    this.ctx = null;
  }
}
