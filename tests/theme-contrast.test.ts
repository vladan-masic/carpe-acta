import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
const css = readFileSync("src/styles.css", "utf8");
function tokens(block: string) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]]));
}
const light = tokens(css.match(/:root\s*\{([^}]+)\}/)![1]);
const dark = { ...light, ...tokens(css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)![1]) };
function luminance(hex: string) {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (values[1] + .05) / (values[0] + .05);
}
it.each([['light', light], ['dark', dark]] as const)("keeps %s text and keyboard focus legible", (_, palette) => {
  for (const surface of ['--bg', '--surface', '--input', '--highlight']) {
    for (const ink of ['--text', '--muted', '--accent-dark']) {
      expect(contrast(palette[ink], palette[surface]), `${ink} on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(palette['--blue'], palette[surface])).toBeGreaterThanOrEqual(3);
  }
  for (const [ink, surface] of [['--on-strong', '--primary'], ['--on-strong', '--control-hover'], ['--badge-text', '--badge'], ['--error-text', '--error-bg'], ['--success-text', '--success-bg']]) {
    expect(contrast(palette[ink], palette[surface]), `${ink} on ${surface}`).toBeGreaterThanOrEqual(4.5);
  }
});
