import { SoundPreset, MetricValues, ChannelDestinations } from './SoundPreset';
import { SoundSource } from './SoundSource';

/**
 * Abstract preset that handles lifecycle routing.
 *
 * Subclasses provide a SoundSource for each metric.
 * BasePreset wires up start/update/stop automatically —
 * null sources are silently skipped.
 */
export abstract class BasePreset implements SoundPreset {
  readonly name: string;

  private ctx: AudioContext | null = null;
  protected readonly cpu: SoundSource | null;
  protected readonly ram: SoundSource | null;
  protected readonly errors: SoundSource | null;

  constructor(
    name: string,
    sources: {
      cpu?: SoundSource | null;
      ram?: SoundSource | null;
      errors?: SoundSource | null;
    }
  ) {
    this.name = name;
    this.cpu = sources.cpu ?? null;
    this.ram = sources.ram ?? null;
    this.errors = sources.errors ?? null;
  }

  start(ctx: AudioContext, destinations: ChannelDestinations): void {
    this.ctx = ctx;
    this.cpu?.start(ctx, destinations.cpu);
    this.ram?.start(ctx, destinations.ram);
    this.errors?.start(ctx, destinations.errors);
  }

  update(metrics: MetricValues): void {
    if (!this.ctx) {
      return;
    }
    this.cpu?.update(metrics.cpu);
    this.ram?.update(metrics.ram);
    this.errors?.update(metrics.errors);
  }

  stop(): void {
    this.cpu?.stop();
    this.ram?.stop();
    this.errors?.stop();
    this.ctx = null;
  }
}
