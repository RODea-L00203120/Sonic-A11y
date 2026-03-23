import React, { useCallback, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SonificationOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

interface Props extends PanelProps<SonificationOptions> {}

const MAX_GAIN = 0.15;

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

export const SonificationPanel: React.FC<Props> = ({ width, height }) => {
  const styles = useStyles2(getStyles);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const applyVolume = useCallback((vol: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = vol * MAX_GAIN;
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    applyVolume(vol);
  }, [applyVolume]);

  const start = useCallback(() => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 220;

    // Safety limiter — gain is scaled by volume (0–1) but never exceeds MAX_GAIN
    gain.gain.value = volume * MAX_GAIN;

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();

    audioCtxRef.current = ctx;
    oscillatorRef.current = oscillator;
    gainRef.current = gain;
    setPlaying(true);
  }, [volume]);

  const stop = useCallback(() => {
    oscillatorRef.current?.stop();
    audioCtxRef.current?.close();
    oscillatorRef.current = null;
    audioCtxRef.current = null;
    gainRef.current = null;
    setPlaying(false);
  }, []);

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
        {playing ? 'Sawtooth 220 Hz' : 'Ready'}
      </div>
    </div>
  );
};
