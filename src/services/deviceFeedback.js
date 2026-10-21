let wakeLockSentinel = null;

export async function requestWakeLock() {
  if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
    try {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinel.addEventListener("release", () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (error) {
      console.warn("Wake Lock request failed:", error);
      return false;
    }
  }
  return false;
}

export async function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    } catch (error) {
      console.warn("Wake Lock release error:", error);
    }
  }
}

function createAudioContext() {
  try {
    const e = window.AudioContext || window.webkitAudioContext;
    if (e) {
      return new e();
    }
  } catch {}
  return null;
}

export function playStartTone() {
  try {
    const e = createAudioContext();
    if (!e) {
      return;
    }
    if (e.state === "suspended") {
      e.resume();
    }
    const t = e.currentTime;
    const s = e.createOscillator();
    const o = e.createGain();
    s.type = "sine";
    s.frequency.setValueAtTime(440, t);
    s.frequency.exponentialRampToValueAtTime(554.37, t + 0.1);
    s.frequency.exponentialRampToValueAtTime(659.25, t + 0.2);
    o.gain.setValueAtTime(0.15, t);
    o.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    s.connect(o);
    o.connect(e.destination);
    s.start(t);
    s.stop(t + 0.36);
  } catch (error) {
    console.debug("Audio tone error", error);
  }
}

export function playStopTone() {
  try {
    const e = createAudioContext();
    if (!e) {
      return;
    }
    if (e.state === "suspended") {
      e.resume();
    }
    const t = e.currentTime;
    const s = e.createOscillator();
    const o = e.createGain();
    s.type = "sine";
    s.frequency.setValueAtTime(659.25, t);
    s.frequency.setValueAtTime(523.25, t + 0.15);
    o.gain.setValueAtTime(0.18, t);
    o.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    s.connect(o);
    o.connect(e.destination);
    s.start(t);
    s.stop(t + 0.46);
  } catch (error) {
    console.debug("Audio tone error", error);
  }
}

export function vibrate(e = "start") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      switch (e) {
        case "start":
          navigator.vibrate([80, 40, 100]);
          break;
        case "stop":
          navigator.vibrate([120, 60, 120]);
          break;
        default:
          navigator.vibrate(80);
      }
    } catch {}
  }
}
