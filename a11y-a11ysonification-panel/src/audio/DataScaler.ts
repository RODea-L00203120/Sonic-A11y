import { PanelData } from '@grafana/data';

/**
 * Extracts the latest numeric value from a Grafana panel data frame
 * and normalizes it to a 0–1 range using the min/max of the series.
 */
export function scaleMetric(data: PanelData): number | null {
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
