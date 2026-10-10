import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const css = readFileSync("src/styles/foundations.css", "utf8");
function tokens(block: string) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]]));
}
const light = tokens(css.match(/:root\[data-design="notebook"\]\s*\{([^}]+)\}/)![1]);
const dark = { ...light, ...tokens(css.match(/:root\[data-design="notebook"\]\[data-theme="dark"\]\s*\{([^}]+)\}/)![1]) };
function luminance(hex: string) {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a: string, b: string) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + .05) / (low + .05);
}

it.each([["light", light], ["dark", dark]] as const)("keeps Notebook %s surfaces and control states accessible", (_, palette) => {
  for (const surface of ["--surface-page", "--surface-paper", "--surface-raised", "--surface-overlay", "--action-tint"]) {
    for (const ink of ["--ink", "--ink-muted", "--action-ink", "--discovery-ink", "--progress-ink"]) {
      expect(contrast(palette[ink], palette[surface]), `${ink} on ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(palette["--focus-ring"], palette[surface]), `focus on ${surface}`).toBeGreaterThanOrEqual(3);
  }
  for (const surface of ["--surface-page", "--surface-paper", "--surface-raised", "--surface-overlay"]) {
    expect(contrast(palette["--control-border"], palette[surface]), `control border on ${surface}`).toBeGreaterThanOrEqual(3);
  }
  for (const state of ["--action", "--action-hover", "--action-pressed"]) {
    expect(contrast("#ffffff", palette[state]), `white on ${state}`).toBeGreaterThanOrEqual(4.5);
  }
  expect(contrast(palette["--support-ink"], palette["--support-tint"])).toBeGreaterThanOrEqual(4.5);
  expect(contrast(palette["--focus-inverse"], "#1f2933")).toBeGreaterThanOrEqual(3);
  expect(contrast(palette["--focus-inverse"], "#39312b")).toBeGreaterThanOrEqual(3);
});
