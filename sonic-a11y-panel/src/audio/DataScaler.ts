import { PanelData } from '@grafana/data';

/**
 * Extracts the latest numeric value from a Grafana panel data frame,
 * or null if no data is available. No scaling is applied — that is
 * the responsibility of per-metric scalers (e.g. CpuScaler).
 */
export function extractLatestValue(data: PanelData): number | null {
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

  return values[values.length - 1];
}
