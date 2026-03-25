import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { ComboboxOption } from '@grafana/ui';
import { SonificationOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MasterChain } from '../audio/MasterChain';
import { extractLatestValue } from '../audio/DataScaler';
import { scaleCpu } from '../audio/scalers/CpuScaler';
import { SoundPreset } from '../audio/SoundPreset';
import { SynthA11y } from '../audio/presets/SynthA11y';
import { TransportBar } from './TransportBar';
import { MetricChannel } from './MetricChannel';
import { MasterVolume } from './MasterVolume';

interface Props extends PanelProps<SonificationOptions> {}

const PRESET_OPTIONS: Array<ComboboxOption<string>> = [
  { label: 'Default', value: 'default' },
];

const getStyles = (theme: GrafanaTheme2) => ({
  panel: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
    overflow: 'hidden',
  }),
  channelArea: css({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(1),
    minHeight: 0,
  }),
  channels: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    flex: 1,
    minHeight: 0,
  }),
  statusBar: css({
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    flexShrink: 0,
  }),
});

export const SonificationPanel: React.FC<Props> = ({ data, width, height }) => {
  const styles = useStyles2(getStyles);

  // --- Audio engine refs ---
  const masterRef = useRef<MasterChain | null>(null);
  const presetRef = useRef<SoundPreset | null>(null);

  // CPU channel audio nodes
  const cpuGainRef = useRef<GainNode | null>(null);
  const cpuPannerRef = useRef<StereoPannerNode | null>(null);

  // --- Transport state ---
  const [playing, setPlaying] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  // --- Master volume ---
  const [masterVol, setMasterVol] = useState(50);
  const masterVolRef = useRef(0.5);

  // --- Per-metric channel state (scaffolded for future use) ---
  const [cpuMuted, setCpuMuted] = useState(false);
  const [cpuVolume, setCpuVolume] = useState(80);
  const [cpuPan, setCpuPan] = useState(0);

  const [ramMuted, setRamMuted] = useState(false);
  const [ramVolume, setRamVolume] = useState(80);
  const [ramPan, setRamPan] = useState(0);

  const [errorsMuted, setErrorsMuted] = useState(false);
  const [errorsVolume, setErrorsVolume] = useState(80);
  const [errorsPan, setErrorsPan] = useState(0);

  // --- Data extraction ---
  const rawValue = extractLatestValue(data);
  const cpu = rawValue !== null ? scaleCpu(rawValue) : 0;

  useEffect(() => {
    presetRef.current?.update(cpu);
  }, [data, cpu]);

  // CPU channel: live-update gain (volume + mute)
  useEffect(() => {
    if (cpuGainRef.current) {
      cpuGainRef.current.gain.value = cpuMuted ? 0 : cpuVolume / 100;
    }
  }, [cpuMuted, cpuVolume]);

  // CPU channel: live-update pan
  useEffect(() => {
    if (cpuPannerRef.current) {
      cpuPannerRef.current.pan.value = cpuPan / 100;
    }
  }, [cpuPan]);

  // --- Audio engine controls ---
  const handleMasterVolume = useCallback((val: number) => {
    setMasterVol(val);
    const normalised = val / 100;
    masterVolRef.current = normalised;
    masterRef.current?.setVolume(normalised);
  }, []);

  const start = useCallback(() => {
    if (masterRef.current) {
      return;
    }
    const master = new MasterChain();
    master.setVolume(masterVolRef.current);
    const ctx = master.ctx;

    // CPU channel: gain → panner → master input
    const cpuGain = ctx.createGain();
    cpuGain.gain.value = cpuMuted ? 0 : cpuVolume / 100;
    const cpuPanner = ctx.createStereoPanner();
    cpuPanner.pan.value = cpuPan / 100;
    cpuGain.connect(cpuPanner);
    cpuPanner.connect(master.input);
    cpuGainRef.current = cpuGain;
    cpuPannerRef.current = cpuPanner;

    // Preset connects to the CPU channel gain (not directly to master)
    const preset = new SynthA11y();
    preset.start(ctx, cpuGain);
    preset.update(cpu);

    masterRef.current = master;
    presetRef.current = preset;
    setPlaying(true);
  }, [cpu, cpuMuted, cpuVolume, cpuPan]);

  const stop = useCallback(() => {
    presetRef.current?.stop();
    cpuGainRef.current?.disconnect();
    cpuPannerRef.current?.disconnect();
    cpuGainRef.current = null;
    cpuPannerRef.current = null;
    masterRef.current?.destroy();
    presetRef.current = null;
    masterRef.current = null;
    setPlaying(false);
  }, []);

  const togglePlaying = useCallback(() => {
    playing ? stop() : start();
  }, [playing, start, stop]);

  return (
    <div
      className={cx(
        styles.panel,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <TransportBar
        playing={playing}
        onToggle={togglePlaying}
        presetOptions={PRESET_OPTIONS}
        selectedPreset={selectedPreset}
        onPresetChange={setSelectedPreset}
      />

      <div className={styles.channelArea}>
        <div className={styles.channels}>
          <MetricChannel
            label="CPU"
            muted={cpuMuted}
            onMuteToggle={() => setCpuMuted(!cpuMuted)}
            volume={cpuVolume}
            onVolumeChange={setCpuVolume}
            pan={cpuPan}
            onPanChange={setCpuPan}
          />
          <MetricChannel
            label="RAM"
            muted={ramMuted}
            onMuteToggle={() => setRamMuted(!ramMuted)}
            volume={ramVolume}
            onVolumeChange={setRamVolume}
            pan={ramPan}
            onPanChange={setRamPan}
          />
          <MetricChannel
            label="Errors"
            muted={errorsMuted}
            onMuteToggle={() => setErrorsMuted(!errorsMuted)}
            volume={errorsVolume}
            onVolumeChange={setErrorsVolume}
            pan={errorsPan}
            onPanChange={setErrorsPan}
          />
        </div>

        <MasterVolume volume={masterVol} onVolumeChange={handleMasterVolume} />
      </div>

      <div className={styles.statusBar}>
        {rawValue !== null
          ? `CPU: ${Math.min(100, Math.max(0, rawValue)).toFixed(1)}% | Preset: Default`
          : 'No data'}
      </div>
    </div>
  );
};
