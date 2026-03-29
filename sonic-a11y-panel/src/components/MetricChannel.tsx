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
}) => {
  const styles = useStyles2(getStyles);
  const id = label.toLowerCase();

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <IconButton
        name={muted ? 'bell-slash' : 'bell'}
        tooltip={muted ? `Unmute ${label}` : `Mute ${label}`}
        size="md"
        onClick={onMuteToggle}
      />
      <div className={styles.volumeSlider}>
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
      <div className={styles.panGroup}>
        <span className={styles.panLabel}>L</span>
        <div className={styles.panSlider}>
          <Slider
            min={-100}
            max={100}
            value={pan}
            onChange={onPanChange}
            step={1}
            inputId={`${id}-pan`}
            showInput={false}
            ariaLabelForHandle={`${label} pan`}
          />
        </div>
        <span className={styles.panLabel}>R</span>
      </div>
    </div>
  );
};
