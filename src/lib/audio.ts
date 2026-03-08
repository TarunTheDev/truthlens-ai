// Web Audio API - 8-bit Minecraft-style sound effects

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AC();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  duration: number,
  volume = 0.08,
  type: OscillatorType = 'square',
  freqEnd?: number,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    if (freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {
    // Suppress audio errors (e.g. document hasn't been interacted with yet)
  }
}

/** Block place blip — plays when a sentence card appears */
export function playBlip() {
  playTone(523, 0.08, 0.07, 'square', 659);
}

/** Mining start sound */
export function playMineStart() {
  playTone(220, 0.12, 0.08, 'square', 165);
  playTone(165, 0.12, 0.06, 'square', 220, 0.12);
}

/** Success ding — audit complete, high trust score */
export function playSuccess() {
  playTone(523, 0.1, 0.07, 'square');
  playTone(659, 0.1, 0.07, 'square', undefined, 0.1);
  playTone(784, 0.15, 0.07, 'square', undefined, 0.2);
  playTone(1047, 0.25, 0.07, 'square', undefined, 0.35);
}

/** Warning buzz — uncertain finding */
export function playUncertain() {
  playTone(330, 0.08, 0.07, 'sawtooth', 220);
  playTone(220, 0.12, 0.05, 'sawtooth', 165, 0.1);
}

/** Error buzz — false claim found */
export function playFalse() {
  playTone(200, 0.15, 0.1, 'sawtooth', 100);
  playTone(100, 0.2, 0.1, 'sawtooth', 80, 0.15);
}

/** Explosion / death sound */
export function playDeath() {
  playTone(150, 0.1, 0.12, 'sawtooth', 80);
  playTone(80, 0.2, 0.1, 'sawtooth', 50, 0.1);
  playTone(50, 0.3, 0.08, 'sawtooth', 30, 0.3);
}

/** Winner fanfare */
export function playWinner() {
  const notes = [
    [523, 0], [659, 0.12], [784, 0.24],
    [1047, 0.36], [784, 0.5], [1047, 0.62],
    [1319, 0.74]
  ];
  notes.forEach(([freq, delay]) => {
    playTone(freq as number, 0.12, 0.08, 'square', undefined, delay as number);
  });
}

/** Click sound */
export function playClick() {
  playTone(440, 0.05, 0.05, 'square', 400);
}

