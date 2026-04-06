import { PanelData } from '@grafana/data';

/**
 * Extracts the latest numeric value from a Grafana panel data series
 * at the given index, or null if no data is available. No scaling is
 * applied — that is the responsibility of per-metric scalers.
 *
 * Series mapping: 0 = CPU, 1 = RAM, 2 = Errors
 */
export function extractLatestValue(data: PanelData, seriesIndex = 0): number | null {
  if (data.series.length <= seriesIndex) {
    return null;
  }

  const frame = data.series[seriesIndex];
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
