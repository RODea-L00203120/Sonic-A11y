import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { Slider, useStyles2 } from '@grafana/ui';

interface MasterVolumeProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    background: theme.colors.background.secondary,
    borderRadius: theme.shape.radius.default,
    border: `1px solid ${theme.colors.border.weak}`,
    minWidth: 48,
  }),
  value: css({
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
  }),
  sliderWrap: css({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minHeight: 60,
  }),
  label: css({
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
  }),
});

export const MasterVolume: React.FC<MasterVolumeProps> = ({ volume, onVolumeChange }) => {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      <span className={styles.value}>{volume}%</span>
      <div className={styles.sliderWrap}>
        <Slider
          min={0}
          max={100}
          value={volume}
          onChange={onVolumeChange}
          step={1}
          inputId="master-volume"
          showInput={false}
          orientation="vertical"
          ariaLabelForHandle="Master volume"
        />
      </div>
      <span className={styles.label}>Master</span>
    </div>
  );
};
