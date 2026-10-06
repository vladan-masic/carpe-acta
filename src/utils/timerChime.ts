// Prepare during a user gesture so expiry does not depend on autoplay permission.
export function createTimerChime() {
  let context: AudioContext | null = null;
  let disposed = false;
  let playing = false;
  async function prepare() {
    if (disposed) return false;
    try {
      context ??= new AudioContext();
      if (context.state === "suspended") await context.resume();
      return !disposed && context.state === "running";
    } catch { return false; }
  }
  return {
    prepare,
    async play() {
      if (playing) return true;
      playing = true;
      if (!await prepare() || !context) { playing = false; return false; }
      try {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); playing = false; };
        oscillator.start(now);
        oscillator.stop(now + 0.85);
        return true;
      } catch { playing = false; return false; }
    },
    dispose() {
      disposed = true;
      if (context && context.state !== "closed") void context.close().catch(() => {});
      context = null;
    },
  };
}
