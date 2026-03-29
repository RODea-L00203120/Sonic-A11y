import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { ComboboxOption } from '@grafana/ui';
import { SonificationOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MasterChain } from '../audio/MasterChain';
import { ChannelStrip } from '../audio/ChannelStrip';
import { extractLatestValue } from '../audio/DataScaler';
import { scaleCpu } from '../audio/scalers/CpuScaler';
import { SoundPreset } from '../audio/SoundPreset';
import { DefaultPreset } from '../audio/presets/default/DefaultPreset';
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
  const cpuStripRef = useRef<ChannelStrip | null>(null);
  const ramStripRef = useRef<ChannelStrip | null>(null);
  const errorsStripRef = useRef<ChannelStrip | null>(null);

  // --- Transport state ---
  const [playing, setPlaying] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');

  // --- Master volume ---
  const [masterVol, setMasterVol] = useState(50);
  const masterVolRef = useRef(0.5);

  // --- Per-metric channel state ---
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
  // For now, using same random walk data for all metrics (only CPU has real data)
  const rawValue = extractLatestValue(data);
  const cpu = rawValue !== null ? scaleCpu(rawValue) : 0;
  // RAM/errors: use same test data source for now, will be separate queries later
  const ram = cpu;
  const errors = 1; // Fire earcon on every refresh for testing

  useEffect(() => {
    presetRef.current?.update({ cpu, ram, errors });
  }, [data, cpu, ram, errors]);

  // Channel strip live-updates
  useEffect(() => {
    cpuStripRef.current?.setMuted(cpuMuted, cpuVolume / 100);
  }, [cpuMuted, cpuVolume]);
  useEffect(() => {
    cpuStripRef.current?.setPan(cpuPan / 100);
  }, [cpuPan]);

  useEffect(() => {
    ramStripRef.current?.setMuted(ramMuted, ramVolume / 100);
  }, [ramMuted, ramVolume]);
  useEffect(() => {
    ramStripRef.current?.setPan(ramPan / 100);
  }, [ramPan]);

  useEffect(() => {
    errorsStripRef.current?.setMuted(errorsMuted, errorsVolume / 100);
  }, [errorsMuted, errorsVolume]);
  useEffect(() => {
    errorsStripRef.current?.setPan(errorsPan / 100);
  }, [errorsPan]);

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

    // Channel strips: each metric gets gain + pan → master
    const cpuStrip = new ChannelStrip(master.ctx, master.input);
    cpuStrip.setVolume(cpuMuted ? 0 : cpuVolume / 100);
    cpuStrip.setPan(cpuPan / 100);
    cpuStripRef.current = cpuStrip;

    const ramStrip = new ChannelStrip(master.ctx, master.input);
    ramStrip.setVolume(ramMuted ? 0 : ramVolume / 100);
    ramStrip.setPan(ramPan / 100);
    ramStripRef.current = ramStrip;

    const errorsStrip = new ChannelStrip(master.ctx, master.input);
    errorsStrip.setVolume(errorsMuted ? 0 : errorsVolume / 100);
    errorsStrip.setPan(errorsPan / 100);
    errorsStripRef.current = errorsStrip;

    // Preset connects to all three channel strips
    const preset = new DefaultPreset();
    preset.start(master.ctx, {
      cpu: cpuStrip.input,
      ram: ramStrip.input,
      errors: errorsStrip.input,
    });
    preset.update({ cpu, ram, errors });

    masterRef.current = master;
    presetRef.current = preset;
    setPlaying(true);
  }, [cpu, ram, errors, cpuMuted, cpuVolume, cpuPan, ramMuted, ramVolume, ramPan, errorsMuted, errorsVolume, errorsPan]);

  const stop = useCallback(() => {
    presetRef.current?.stop();
    cpuStripRef.current?.disconnect();
    ramStripRef.current?.disconnect();
    errorsStripRef.current?.disconnect();
    cpuStripRef.current = null;
    ramStripRef.current = null;
    errorsStripRef.current = null;
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
