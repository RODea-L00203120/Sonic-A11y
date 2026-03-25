import { SoundPreset } from '../SoundPreset';

// --- Tuning constants ---

const GLIDE_TIME = 0.3;

// LPF cutoff range
const LPF_MIN_FREQ = 300;
const LPF_MAX_FREQ = 15000;

// HPF to remove low-end mud
const HPF_FREQ = 180;

// C major triad spread across two octaves (C3 E3 G3 C4 E4 G4)
const CHORD_FREQS = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0];
const CHORD_GAINS = [1.0, 0.7, 0.9, 0.6, 0.4, 0.5];

// LFO — slow wobble at low metric, agitated at high
const LFO_MIN_RATE = 0.3;
const LFO_MAX_RATE = 6.0;
const LFO_DEPTH = 0.1;

// Waveshaper distortion
const DISTORTION_SAMPLES = 256;
const MAX_DISTORTION = 8.0;

// --- Helpers ---

function makeDistortionCurve(drive: number): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(DISTORTION_SAMPLES);
  for (let i = 0; i < DISTORTION_SAMPLES; i++) {
    const x = (i * 2) / DISTORTION_SAMPLES - 1;
    curve[i] = drive === 0 ? x : Math.tanh(drive * x);
  }
  return curve;
}

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
  private waveshaper: WaveShaperNode | null = null;

  start(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;

    // --- Filters ---

    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = HPF_FREQ;
    hpf.Q.value = 0.5;

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = LPF_MIN_FREQ;
    lpf.Q.value = 1.5;
    this.lpf = lpf;

    const notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = 660;
    notch.Q.value = 8;

    // --- Waveshaper ---

    const waveshaper = ctx.createWaveShaper();
    waveshaper.curve = makeDistortionCurve(0);
    waveshaper.oversample = '4x';
    this.waveshaper = waveshaper;

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

    chordMix.connect(waveshaper);
    waveshaper.connect(hpf);
    hpf.connect(notch);
    notch.connect(lpf);
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
    const t = this.ctx.currentTime;

    // LPF cutoff — muffled at idle, bright at load
    this.lpf?.frequency.setTargetAtTime(metricToFilterCutoff(value), t, GLIDE_TIME);

    // LFO rate — calm to agitated
    const lfoRate = LFO_MIN_RATE + value * (LFO_MAX_RATE - LFO_MIN_RATE);
    this.lfo?.frequency.setTargetAtTime(lfoRate, t, GLIDE_TIME);

    // Distortion — clean to gritty
    if (this.waveshaper) {
      this.waveshaper.curve = makeDistortionCurve(value * MAX_DISTORTION);
    }
  }

  stop(): void {
    this.oscillators.forEach((osc) => osc.stop());
    this.lfo?.stop();
    this.oscillators = [];
    this.lfo = null;
    this.lpf = null;
    this.waveshaper = null;
    this.ctx = null;
  }
}
