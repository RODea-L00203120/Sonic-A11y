import { BasePreset } from '../../BasePreset';
import { CpuDrone } from '../../sounds/CpuDrone';
import { RamDrone } from '../../sounds/RamDrone';
import { BellEarcon } from '../../sounds/BellEarcon';

/**
 * Default preset — one cohesive sound design covering all metrics.
 *
 * CPU:    Sawtooth chord drone, brightness + LFO mapped to load
 * RAM:    Sawtooth seventh (B3), reverb-as-space metaphor
 * Errors: FM bell earcon with reverb tail
 */
export class DefaultPreset extends BasePreset {
  constructor() {
    super('Default', {
      cpu: new CpuDrone(),
      ram: new RamDrone(),
      errors: new BellEarcon(),
    });
  }
}
