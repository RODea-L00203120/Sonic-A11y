import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SonificationOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MasterChain } from '../audio/MasterChain';
import { scaleMetric } from '../audio/DataScaler';
import { SoundPreset } from '../audio/SoundPreset';
import { SynthA11y } from '../audio/presets/SynthA11y';

interface Props extends PanelProps<SonificationOptions> {}

const getStyles = () => ({
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
});

export const SonificationPanel: React.FC<Props> = ({ data, width, height }) => {
  const styles = useStyles2(getStyles);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const volumeRef = useRef(0.5);

  const masterRef = useRef<MasterChain | null>(null);
  const presetRef = useRef<SoundPreset | null>(null);

  const metricValue = scaleMetric(data);
  const cpu = metricValue ?? 0;

  // Update preset when metric data changes
  useEffect(() => {
    presetRef.current?.update(cpu);
  }, [cpu]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    volumeRef.current = vol;
    masterRef.current?.setVolume(vol);
  }, []);

  const start = useCallback(() => {
    if (masterRef.current) {
      return;
    }

    const master = new MasterChain();
    master.setVolume(volumeRef.current);

    const preset = new SynthA11y();
    preset.start(master.ctx, master.input);
    preset.update(cpu);

    masterRef.current = master;
    presetRef.current = preset;
    setPlaying(true);
  }, [cpu]);

  const stop = useCallback(() => {
    presetRef.current?.stop();
    masterRef.current?.destroy();
    presetRef.current = null;
    masterRef.current = null;
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
        {metricValue !== null
          ? `Metric: ${(metricValue * 100).toFixed(1)}% | Preset: Synth A11y`
          : 'No data'}
      </div>
    </div>
  );
};
