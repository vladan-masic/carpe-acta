import { afterEach, expect, it, vi } from "vitest";
import { createTimerChime } from "../src/utils/timerChime";
afterEach(() => { vi.unstubAllGlobals(); });

it("prepares audio, plays one short tapered tone without overlap, and releases it", async () => {
  const oscillator = { type: "", frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: () => {} };
  const gain = { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
  const close = vi.fn().mockResolvedValue(undefined);
  class Context {
    state = "suspended";
    currentTime = 10;
    destination = {};
    resume = vi.fn(async () => { this.state = "running"; });
    createOscillator = () => oscillator;
    createGain = () => gain;
    close = close;
  }
  vi.stubGlobal("AudioContext", Context);
  const sound = createTimerChime();
  expect(await sound.prepare()).toBe(true);
  await Promise.all([sound.play(), sound.play()]);
  expect(oscillator.start).toHaveBeenCalledTimes(1);
  expect(oscillator.stop).toHaveBeenCalledWith(10.85);
  expect(gain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.12, 10.03);
  oscillator.onended();
  expect(oscillator.disconnect).toHaveBeenCalled();
  expect(gain.disconnect).toHaveBeenCalled();
  sound.dispose();
  expect(close).toHaveBeenCalledTimes(1);
  expect(await sound.play()).toBe(false);
});

it("does not play after disposal while audio permission is pending", async () => {
  let resolve!: () => void;
  const createOscillator = vi.fn();
  class Context {
    state = "suspended";
    resume = () => new Promise<void>(done => { resolve = () => { this.state = "running"; done(); }; });
    close = vi.fn().mockResolvedValue(undefined);
    createOscillator = createOscillator;
  }
  vi.stubGlobal("AudioContext", Context);
  const sound = createTimerChime();
  const pending = sound.play();
  sound.dispose();
  resolve();
  expect(await pending).toBe(false);
  expect(createOscillator).not.toHaveBeenCalled();
});

it("fails gracefully when audio is unsupported or blocked", async () => {
  vi.stubGlobal("AudioContext", undefined);
  expect(await createTimerChime().play()).toBe(false);
  vi.stubGlobal("AudioContext", class { state = "suspended"; resume() { return Promise.reject(new Error("Blocked")); } });
  expect(await createTimerChime().prepare()).toBe(false);
});
