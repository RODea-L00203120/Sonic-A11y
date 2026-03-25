/**
 * Static EQ shaping for the Synth A11y preset.
 *
 * Chain: input → HPF (remove mud) → notch (tame harshness) → output
 *
 * The data-driven LPF remains in the preset itself since brightness
 * control is core to the sonification mapping.
 */
export class SynthA11yEQ {
  /** Connect signal into this node. */
  readonly input: AudioNode;
  /** Connect this node to the next stage. */
  readonly output: AudioNode;

  constructor(ctx: AudioContext) {
    // HPF — remove low-end mud
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 180;
    hpf.Q.value = 0.5;

    // Notch — tame mid-frequency harshness
    const notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = 660;
    notch.Q.value = 8;

    hpf.connect(notch);

    this.input = hpf;
    this.output = notch;
  }
}
