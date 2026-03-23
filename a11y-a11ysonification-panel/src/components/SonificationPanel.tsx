import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SonificationOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

interface Props extends PanelProps<SonificationOptions> {}

const MAX_GAIN = 0.15;
const GLIDE_TIME = 0.3;

// LPF cutoff range
const LPF_MIN_FREQ = 300;
const LPF_MAX_FREQ = 15000;

// HPF to remove low-end mud
const HPF_FREQ = 180;

// C major triad spread across octaves (C3, E3, G3, C4, E4, G4)
const CHORD_FREQS = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0];
// Thirds slightly lower, higher octave voices quieter for depth
const CHORD_GAINS = [1.0, 0.7, 0.9, 0.6, 0.4, 0.5];

// LFO rate range — slow wobble at low CPU, agitated at high
const LFO_MIN_RATE = 0.3;
const LFO_MAX_RATE = 6.0;
const LFO_DEPTH = 0.1;

// Waveshaper distortion
const DISTORTION_SAMPLES = 256;
const MAX_DISTORTION = 8.0;


function makeDistortionCurve(drive: number): Float32Array {
  const curve = new Float32Array(DISTORTION_SAMPLES);
  for (let i = 0; i < DISTORTION_SAMPLES; i++) {
    const x = (i * 2) / DISTORTION_SAMPLES - 1;
    if (drive === 0) {
      curve[i] = x;
    } else {
      curve[i] = Math.tanh(drive * x);
    }
  }
  return curve;
}

function getLatestValue(data: PanelProps['data']): number | null {
  if (data.series.length === 0) {
    return null;
  }

  const frame = data.series[0];
  const valueField = frame.fields.find((f) => f.type === 'number');
  if (!valueField || valueField.values.length === 0) {
    return null;
  }

  const values = valueField.values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (values.length === 0) {
    return null;
  }

  const latest = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return 0.5;
  }

  return (latest - min) / (max - min);
}

function metricToFilterCutoff(value: number): number {
  return LPF_MIN_FREQ * Math.pow(LPF_MAX_FREQ / LPF_MIN_FREQ, value);
}

interface AudioRefs {
  ctx: AudioContext;
  oscillators: OscillatorNode[];
  lfo: OscillatorNode;
  lpf: BiquadFilterNode;
  waveshaper: WaveShaperNode;
  volumeGain: GainNode;
}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    `,
    button: css`
      padding: 12px 24px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      color: #fff;
    `,
    playing: css`
      background: #e74c3c;
    `,
    stopped: css`
      background: #2ecc71;
    `,
    volumeControl: css`
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
    `,
    volumeLabel: css`
      font-size: 12px;
      min-width: 32px;
      text-align: right;
    `,
    slider: css`
      width: 120px;
      cursor: pointer;
    `,
    status: css`
      position: absolute;
      bottom: 8px;
      left: 12px;
      font-size: 12px;
      opacity: 0.7;
    `,
  };
};

export const SonificationPanel: React.FC<Props> = ({ data, width, height }) => {
  const styles = useStyles2(getStyles);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const volumeRef = useRef(0.5);
  const audioRef = useRef<AudioRefs | null>(null);

  const metricValue = getLatestValue(data);
  const cpu = metricValue ?? 0;

  // Update metric-driven parameters when data changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) {
      return;
    }

    const t = a.ctx.currentTime;

    // 1. LPF cutoff — muffled at idle, bright at load
    const cutoff = metricToFilterCutoff(cpu);
    a.lpf.frequency.setTargetAtTime(cutoff, t, GLIDE_TIME);

    // 2. LFO rate — calm to agitated
    const lfoRate = LFO_MIN_RATE + cpu * (LFO_MAX_RATE - LFO_MIN_RATE);
    a.lfo.frequency.setTargetAtTime(lfoRate, t, GLIDE_TIME);

    // 3. Distortion — clean to gritty
    const drive = cpu * MAX_DISTORTION;
    a.waveshaper.curve = makeDistortionCurve(drive);
  }, [cpu]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    volumeRef.current = vol;
    if (audioRef.current) {
      audioRef.current.volumeGain.gain.value = vol;
    }
  }, []);

  const start = useCallback(() => {
    if (audioRef.current) {
      return;
    }

    const ctx = new AudioContext();

    // HPF — remove low-end mud
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = HPF_FREQ;
    hpf.Q.value = 0.5;

    // LPF — cutoff mapped to CPU metric
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = metricToFilterCutoff(cpu);
    lpf.Q.value = 1.5;

    // Waveshaper for saturation/distortion
    const waveshaper = ctx.createWaveShaper();
    waveshaper.curve = makeDistortionCurve(cpu * MAX_DISTORTION);
    waveshaper.oversample = '4x';

    // LFO — modulates chord mix amplitude
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = LFO_MIN_RATE + cpu * (LFO_MAX_RATE - LFO_MIN_RATE);
    lfoGain.gain.value = LFO_DEPTH;

    // Chord mix bus
    const chordMix = ctx.createGain();
    chordMix.gain.value = 1.0;

    lfo.connect(lfoGain);
    lfoGain.connect(chordMix.gain);

    // Notch filter — tame the 660 Hz harmonic pile-up
    const notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = 660;
    notch.Q.value = 8;

    // Volume control (user slider, 0–1)
    const volumeGain = ctx.createGain();
    volumeGain.gain.value = volumeRef.current;

    // Safety limiter — hard ceiling
    const limiter = ctx.createGain();
    limiter.gain.value = MAX_GAIN;

    // Signal chain: oscillators → chordMix → waveshaper → HPF → notch → LPF → volume → limiter → output
    chordMix.connect(waveshaper);
    waveshaper.connect(hpf);
    hpf.connect(notch);
    notch.connect(lpf);
    lpf.connect(volumeGain);
    volumeGain.connect(limiter);
    limiter.connect(ctx.destination);

    // C major triad across two octaves
    const oscillators: OscillatorNode[] = CHORD_FREQS.map((freq, i) => {
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

    audioRef.current = { ctx, oscillators, lfo, lpf, waveshaper, volumeGain };
    setPlaying(true);
  }, [cpu]);

  const stop = useCallback(() => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.oscillators.forEach((osc) => osc.stop());
    audioRef.current.lfo.stop();
    audioRef.current.ctx.close();
    audioRef.current = null;
    setPlaying(false);
  }, []);

  const cutoffFreq = metricToFilterCutoff(cpu);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <div>
        <button
          className={cx(styles.button, playing ? styles.playing : styles.stopped)}
          onClick={playing ? stop : start}
        >
          {playing ? 'Stop' : 'Play'}
        </button>
        <div className={styles.volumeControl}>
          <label className={styles.volumeLabel}>{Math.round(volume * 100)}%</label>
          <input
            className={styles.slider}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>
      <div className={styles.status}>
        {metricValue !== null
          ? `CPU: ${(metricValue * 100).toFixed(1)}% | LPF: ${Math.round(cutoffFreq)} Hz`
          : 'No data'}
      </div>
    </div>
  );
};
