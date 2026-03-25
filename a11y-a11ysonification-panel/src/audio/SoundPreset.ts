/**
 * Interface that all sonification presets must implement.
 *
 * Each preset receives a normalized metric value (0–1) and connects
 * its output to the MasterChain's input node.
 */
export interface SoundPreset {
  /** Display name shown in the UI */
  readonly name: string;

  /**
   * Build the audio graph and start generating sound.
   * Connect final output to the provided destination node.
   */
  start(ctx: AudioContext, destination: AudioNode): void;

  /**
   * Called when the metric value changes.
   * @param value normalized 0–1
   */
  update(value: number): void;

  /** Tear down oscillators and release resources. */
  stop(): void;
}
