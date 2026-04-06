import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { IconButton, Slider, useStyles2 } from '@grafana/ui';

interface MetricChannelProps {
  label: string;
  muted: boolean;
  onMuteToggle: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  pan: number;
  onPanChange: (value: number) => void;
  /** Raw metric value for display in tooltip and screen reader (e.g. 42.5 for 42.5%) */
  metricValue: string | null;
}

const getStyles = (theme: GrafanaTheme2) => ({
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    background: theme.colors.background.secondary,
    borderRadius: theme.shape.radius.default,
    border: `1px solid ${theme.colors.border.weak}`,
  }),
  label: css({
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.primary,
    minWidth: 48,
    fontWeight: theme.typography.fontWeightMedium,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'default',
    '&:focus': {
      outline: `2px solid ${theme.colors.primary.main}`,
      outlineOffset: 2,
      borderRadius: theme.shape.radius.default,
    },
  }),
  volumeSlider: css({
    flex: 1,
    minWidth: 80,
  }),
  panGroup: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    minWidth: 90,
  }),
  panLabel: css({
    flexShrink: 0,
  }),
  panSlider: css({
    flex: 1,
    minWidth: 50,
  }),
});

export const MetricChannel: React.FC<MetricChannelProps> = ({
  label,
  muted,
  onMuteToggle,
  volume,
  onVolumeChange,
  pan,
  onPanChange,
  metricValue,
}) => {
  const styles = useStyles2(getStyles);
  const id = label.toLowerCase();

  const panDirection = pan < 0 ? `${Math.abs(pan)}% left` : pan > 0 ? `${pan}% right` : 'center';
  const muteLabel = muted ? `Unmute ${label}` : `Mute ${label}`;
  const metricReadout = metricValue !== null ? `${label}: ${metricValue}` : `${label}: no data`;
  const panDetail = `${label} pan: ${panDirection}`;

  return (
    <div className={styles.row} role="group" aria-label={`${label} channel`}>
      <button className={styles.label} title={metricReadout} tabIndex={0} type="button">{metricValue !== null ? `${label}: ${metricValue}` : label}</button>
      <IconButton
        name={muted ? 'bell-slash' : 'bell'}
        tooltip={muteLabel}
        size="md"
        onClick={onMuteToggle}
      />
      <div className={styles.volumeSlider} title={`${label} volume: ${volume}%`}>
        <Slider
          min={0}
          max={100}
          value={volume}
          onChange={onVolumeChange}
          step={1}
          inputId={`${id}-volume`}
          showInput={false}
          ariaLabelForHandle={`${label} volume`}
        />
      </div>
      <div className={styles.panGroup} role="group" aria-label={`${label} stereo pan`} title={panDetail}>
        <span className={styles.panLabel} aria-hidden="true">L</span>
        <div className={styles.panSlider}>
          <Slider
            min={-100}
            max={100}
            value={pan}
            onChange={onPanChange}
            step={1}
            inputId={`${id}-pan`}
            showInput={false}
            ariaLabelForHandle={`${label} pan, ${panDirection}`}
          />
        </div>
        <span className={styles.panLabel} aria-hidden="true">R</span>
      </div>
    </div>
  );
};
