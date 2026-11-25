let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

function playTone(freq, type, duration, delay = 0, gainVal = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
  }
}

export function playKlakson8Bit() {
  playTone(392, "square", 0.14, 0, 0.07);
  playTone(523.25, "square", 0.14, 0, 0.05);
  playTone(392, "square", 0.24, 0.18, 0.07);
  playTone(523.25, "square", 0.24, 0.18, 0.05);
}

export function playRemStasiun() {
  playTone(440, "triangle", 0.12, 0, 0.08);
  playTone(349.23, "triangle", 0.14, 0.12, 0.07);
  playTone(261.63, "square", 0.18, 0.24, 0.05);
}

export function playPintuBuka() {
  playTone(240, "triangle", 0.08, 0, 0.07);
  playTone(320, "triangle", 0.08, 0.07, 0.07);
  playTone(392, "square", 0.07, 0.2, 0.06);
  playTone(523.25, "square", 0.08, 0.27, 0.06);
  playTone(659.25, "square", 0.12, 0.34, 0.07);
}

export function playBerangkatJingle() {
  playTone(523.25, "square", 0.08, 0, 0.07);
  playTone(659.25, "square", 0.08, 0.08, 0.07);
  playTone(783.99, "square", 0.08, 0.16, 0.07);
  playTone(1046.5, "square", 0.12, 0.24, 0.08);
  playTone(783.99, "square", 0.08, 0.37, 0.07);
  playTone(1046.5, "square", 0.24, 0.46, 0.09);
}

export function playTambahGerbong() {
  playTone(196, "triangle", 0.08, 0, 0.1);
  playTone(329.63, "square", 0.1, 0.07, 0.06);
}

export function playSelectBlip() {
  playTone(660, "square", 0.05, 0, 0.05);
}
