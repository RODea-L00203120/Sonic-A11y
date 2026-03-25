import { BasePreset } from '../../BasePreset';
import { CpuDrone } from '../../sounds/CpuDrone';
import { BellEarcon } from '../../sounds/BellEarcon';

/**
 * Default preset — one cohesive sound design covering all metrics.
 *
 * CPU:    Sawtooth chord drone, brightness + LFO mapped to load
 * RAM:    (placeholder)
 * Errors: FM bell earcon with reverb tail
 */
export class DefaultPreset extends BasePreset {
  constructor() {
    super('Default', {
      cpu: new CpuDrone(),
      ram: null,
      errors: new BellEarcon(),
    });
  }
}
