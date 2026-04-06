import React from 'react';
import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { css, cx } from '@emotion/css';
import { Icon, RadioButtonGroup, useStyles2 } from '@grafana/ui';

interface TransportBarProps {
  playing: boolean;
  onToggle: () => void;
  presetOptions: Array<SelectableValue<string>>;
  selectedPreset: string;
  onPresetChange: (value: string) => void;
  dataSourceOptions: Array<SelectableValue<string>>;
  selectedDataSource: string;
  onDataSourceChange: (value: string) => void;
}

const getStyles = (theme: GrafanaTheme2) => ({
  bar: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
  }),
  powerBtn: css({
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.radius.circle,
    border: `2px solid ${theme.colors.border.weak}`,
    background: 'transparent',
    color: theme.colors.text.disabled,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
    '&:hover': {
      borderColor: theme.colors.border.medium,
    },
  }),
  powerBtnOn: css({
    color: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
    boxShadow: `0 0 8px ${theme.colors.primary.transparent}`,
  }),
  divider: css({
    width: 1,
    height: 24,
    background: theme.colors.border.weak,
    margin: `0 ${theme.spacing(0.5)}`,
  }),
  presetGroup: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  }),
  presetLabel: css({
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    whiteSpace: 'nowrap',
  }),
  presetSelect: css({
    minWidth: 150,
  }),
});

export const TransportBar: React.FC<TransportBarProps> = ({
  playing,
  onToggle,
  presetOptions,
  selectedPreset,
  onPresetChange,
  dataSourceOptions,
  selectedDataSource,
  onDataSourceChange,
}) => {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.bar} role="toolbar" aria-label="Sonification controls">
      <button
        className={cx(styles.powerBtn, playing && styles.powerBtnOn)}
        onClick={onToggle}
        aria-label={playing ? 'Stop sonification' : 'Start sonification'}
      >
        <Icon name="power" size="lg" />
      </button>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.presetGroup}>
        <span className={styles.presetLabel}>Preset</span>
        <RadioButtonGroup
          options={presetOptions}
          value={selectedPreset}
          onChange={(value) => onPresetChange(value)}
          size="sm"
          aria-label="Preset"
        />
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.presetGroup}>
        <span className={styles.presetLabel}>Source</span>
        <RadioButtonGroup
          options={dataSourceOptions}
          value={selectedDataSource}
          onChange={(value) => onDataSourceChange(value)}
          size="sm"
          aria-label="Data source"
        />
      </div>
    </div>
  );
};
