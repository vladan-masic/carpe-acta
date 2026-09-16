import { describe, expect, it, vi, afterEach } from "vitest";
import { tips } from "../src/data/tips";
import { localeOptions } from "../src/i18n/locales";
import { localizeTip } from "../src/i18n/localizeTip";
import { messages } from "../src/i18n/messages";
import { tipTranslations } from "../src/i18n/tips";
import { getDailyQuest, getRandomTip } from "../src/utils/tips";

describe("tip library integrity", () => {
  it("has unique, nonempty IDs and positive finite effort values", () => {
    expect(tips.length).toBeGreaterThan(0);
    expect(new Set(tips.map((tip) => tip.id)).size).toBe(tips.length);
    for (const tip of tips) {
      expect(tip.id.trim()).not.toBe("");
      expect(Number.isFinite(tip.effortMinutes)).toBe(true);
      expect(tip.effortMinutes).toBeGreaterThan(0);
      expect(Array.isArray(tip.tags)).toBe(true);
    }
  });

  for (const { id: locale } of localeOptions) {
    it(`has complete, nonempty content and valid categories in ${locale}`, () => {
      const translations = tipTranslations[locale];
      expect(Object.keys(translations).sort()).toEqual(tips.map((tip) => tip.id).sort());
      for (const tip of tips) {
        expect(messages[locale].categories).toHaveProperty(tip.categoryId);
        expect(messages[locale].categories[tip.categoryId].trim()).not.toBe("");
        const content = translations[tip.id];
        for (const field of ["title", "text", "action"] as const) {
          expect(content[field].trim()).not.toBe("");
        }
        if (content.whyItWorks !== undefined) {
          expect(content.whyItWorks.trim()).not.toBe("");
        }
      }
    });

    it(`localizes every tip without changing metadata in ${locale}`, () => {
      for (const tip of tips) {
        const original = structuredClone(tip);
        expect(localizeTip(tip, locale)).toEqual({
          ...original,
          ...tipTranslations[locale][tip.id],
          category: messages[locale].categories[tip.categoryId],
          effort: `${tip.effortMinutes} min`,
        });
        expect(tip).toEqual(original);
      }
    });
  }

  it("selects the requested language for the same tip", () => {
    expect(localizeTip(tips[0], "en").title).toBe("Two-Minute Start");
    expect(localizeTip(tips[0], "sr-Latn").title).toBe("Početak od dva minuta");
  });
});

describe("random selection", () => {
  afterEach(() => vi.restoreAllMocks());

  it("can reach every entry in the supplied pool", () => {
    const random = vi.spyOn(Math, "random");
    tips.forEach((tip, index) => {
      random.mockReturnValue((index + 0.5) / tips.length);
      expect(getRandomTip(tips)).toBe(tip);
    });
  });

  it("excludes the current tip while keeping every alternative reachable", () => {
    const random = vi.spyOn(Math, "random");
    for (const current of tips) {
      const alternatives = tips.filter((tip) => tip.id !== current.id);
      alternatives.forEach((tip, index) => {
        random.mockReturnValue((index + 0.5) / alternatives.length);
        expect(getRandomTip(tips, current.id)).toBe(tip);
      });
    }
  });

  it("returns the sole entry even when it is excluded", () => {
    expect(getRandomTip([tips[0]], tips[0].id)).toBe(tips[0]);
  });

  it("handles an excluded ID outside the pool", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomTip(tips.slice(1), tips[0].id)).toBe(tips[1]);
  });

  it("rejects an empty pool", () => {
    expect(() => getRandomTip([])).toThrow("Cannot choose a random tip from an empty list.");
  });
});

describe("daily selection", () => {
  it("uses the local calendar date, independent of time of day", () => {
    const pool = tips.slice(0, 3);
    expect(getDailyQuest(pool, new Date(1970, 0, 2, 0, 1))).toBe(pool[1]);
    expect(getDailyQuest(pool, new Date(1970, 0, 2, 23, 59))).toBe(pool[1]);
    expect(getDailyQuest(pool, new Date(1970, 0, 3))).toBe(pool[2]);
    expect(getDailyQuest(pool, new Date(1970, 0, 4))).toBe(pool[0]);
  });

  it("returns the sole entry", () => {
    expect(getDailyQuest([tips[0]], new Date(2026, 8, 16))).toBe(tips[0]);
  });

  it("rejects an empty pool", () => {
    expect(() => getDailyQuest([])).toThrow("Cannot choose a daily quest from an empty list.");
  });
});
