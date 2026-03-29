/**
 * Normalised metric values passed to presets on each update.
 * All values are 0–1 after per-metric perceptual scaling.
 */
export interface MetricValues {
  cpu: number;
  ram: number;
  errors: number;
}

/**
 * A channel destination map for connecting preset outputs
 * to per-metric channel strips.
 */
export interface ChannelDestinations {
  cpu: AudioNode;
  ram: AudioNode;
  errors: AudioNode;
}

/**
 * Interface that all sonification presets must implement.
 *
 * Each preset defines the complete sound design for all metrics.
 * It receives per-metric destination nodes to connect its outputs,
 * and a metrics object on each update.
 */
export interface SoundPreset {
  /** Display name shown in the UI */
  readonly name: string;

  /**
   * Build the audio graph and start generating sound.
   * Connect each metric's sound to the corresponding destination.
   */
  start(ctx: AudioContext, destinations: ChannelDestinations): void;

  /**
   * Called when metric values change.
   */
  update(metrics: MetricValues): void;

  /** Tear down oscillators and release resources. */
  stop(): void;
}
