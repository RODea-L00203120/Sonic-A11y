import { SoundSource } from '../SoundSource';
import { Reverb } from '../effects/Reverb';
import { ErrorTrigger } from '../scalers/ErrorTrigger';

const FREQ = 987.77;        // B5
const MOD_RATIO = 1.4;      // Inharmonic ratio for bell-like tone
const MOD_DEPTH = 500;
const DURATION = 1.2;
const ATTACK = 0.005;
const DECAY = 1.0;

/**
 * Error sound source — FM bell earcon with reverb.
 *
 * One-shot: no persistent oscillators. A bell is fired on each
 * trigger, rings out through a persistent reverb tail.
 */
export class BellEarcon implements SoundSource {
  private ctx: AudioContext | null = null;
  private destination: AudioNode | null = null;
  private reverb: Reverb | null = null;
  private readonly trigger = new ErrorTrigger(1.0);

  start(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;

    const reverb = new Reverb(ctx, 2.5, 1.8);
    reverb.setMix(0.5);
    reverb.output.connect(destination);
    this.reverb = reverb;
    this.destination = reverb.input;
  }

  update(value: number): void {
    if (!this.ctx || !this.destination) {
      return;
    }

    if (this.trigger.shouldFire(value, this.ctx.currentTime)) {
      this.fire();
    }
  }

  stop(): void {
    this.destination = null;
    this.reverb = null;
    this.trigger.reset();
    this.ctx = null;
  }

  private fire(): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // Bell envelope: near-instant attack, long exponential decay
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.35, now + ATTACK);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + ATTACK + DECAY);
    envelope.connect(this.destination!);

    // FM bell: sine modulator at inharmonic ratio for metallic partials
    const modulator = ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = FREQ * MOD_RATIO;

    const modGain = ctx.createGain();
    modGain.gain.value = MOD_DEPTH;

    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = FREQ;

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(envelope);

    modulator.start(now);
    carrier.start(now);

    const stopTime = now + DURATION;
    modulator.stop(stopTime);
    carrier.stop(stopTime);

    setTimeout(() => {
      modulator.disconnect();
      carrier.disconnect();
      envelope.disconnect();
    }, DURATION * 1000 + 100);
  }
}
