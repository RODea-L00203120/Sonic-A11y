/**
 * A composable sound component — start/update/stop lifecycle.
 *
 * SoundSources are the building blocks of presets. Each source owns
 * its own audio graph and can be assigned to any metric slot.
 */
export interface SoundSource {
  start(ctx: AudioContext, destination: AudioNode): void;
  update(value: number): void;
  stop(): void;
}
