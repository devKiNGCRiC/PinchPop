const STORAGE_KEY = "pinchpop.sound";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

interface ToneOptions {
  freq: number;
  type?: OscillatorType;
  gain?: number;
  duration?: number;
  /** Seconds from now. */
  delay?: number;
  /** Glide to this frequency over the tone. */
  slideTo?: number;
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Tiny procedural sound effects made with the Web Audio API: no audio files to host or license.
 * Browsers only allow audio after a user gesture, so call `unlock()` from a click.
 */
export function createSound() {
  let context: AudioContext | null = null;
  let enabled = readPreference();

  function unlock(): void {
    if (!context) {
      const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return;
      context = new Ctor();
    }
    void context.resume();
  }

  function tone({
    freq,
    type = "sine",
    gain = 0.16,
    duration = 0.12,
    delay = 0,
    slideTo,
  }: ToneOptions) {
    if (!enabled || !context) return;
    const start = context.currentTime + delay;
    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(context.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function noise(duration: number, gain: number) {
    if (!enabled || !context) return;
    const length = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = context.createBufferSource();
    const amp = context.createGain();
    source.buffer = buffer;
    amp.gain.value = gain;
    source.connect(amp).connect(context.destination);
    source.start();
  }

  return {
    unlock,
    isEnabled: () => enabled,
    setEnabled(value: boolean) {
      enabled = value;
      try {
        localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
      } catch {
        // Preference just will not persist.
      }
    },
    /** Countdown tick: pitch rises as the shutter gets closer. */
    beep: (n: number) => tone({ freq: 520 + (3 - n) * 130, type: "triangle", duration: 0.14 }),
    shutter() {
      noise(0.09, 0.22);
      tone({ freq: 240, slideTo: 90, type: "square", gain: 0.1, duration: 0.14 });
    },
    shatter() {
      noise(0.35, 0.28);
      tone({ freq: 880, slideTo: 110, type: "sawtooth", gain: 0.08, duration: 0.4 });
    },
    pickup: () => tone({ freq: 660, duration: 0.06, gain: 0.1 }),
    snap() {
      tone({ freq: 880, type: "triangle", duration: 0.07 });
      tone({ freq: 1320, type: "triangle", duration: 0.09, delay: 0.06 });
    },
    complete() {
      [523, 659, 784, 1047].forEach((freq, i) =>
        tone({ freq, type: "triangle", duration: 0.2, delay: i * 0.1, gain: 0.18 }),
      );
    },
    saved() {
      tone({ freq: 784, duration: 0.12 });
      tone({ freq: 1175, duration: 0.2, delay: 0.1 });
    },
    close() {
      void context?.close();
      context = null;
    },
  };
}

export type Sound = ReturnType<typeof createSound>;
