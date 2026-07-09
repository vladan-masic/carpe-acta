import { useMemo, useState } from "react";
import { CategoryFilter } from "./components/CategoryFilter";
import { DailyQuest } from "./components/DailyQuest";
import { TipCard } from "./components/TipCard";
import { TipsPreview } from "./components/TipsPreview";
import { tips } from "./data/tips";
import { getDailyQuest, getRandomTip } from "./utils/tips";

export function App() {
  const dailyQuest = useMemo(() => getDailyQuest(tips), []);
  const categories = useMemo(
    () => Array.from(new Set(tips.map((tip) => tip.category))),
    [],
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTip, setActiveTip] = useState(() => getRandomTip(tips));

  const filteredTips = useMemo(() => {
    if (selectedCategory === "All") {
      return tips;
    }

    return tips.filter((tip) => tip.category === selectedCategory);
  }, [selectedCategory]);

  function handleGenerateTip() {
    setActiveTip((currentTip) => getRandomTip(filteredTips, currentTip.id));
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    const nextTips =
      category === "All" ? tips : tips.filter((tip) => tip.category === category);
    setActiveTip(getRandomTip(nextTips));
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Anti-procrastination quests</p>
          <h1>Carpe Acta</h1>
          <p className="hero-lede">
            Stop waiting for motivation. Draw one practical action, do the next
            small thing, and build momentum one quest at a time.
          </p>
        </div>

        <DailyQuest quest={dailyQuest} />
      </section>

      <section className="generator-section" aria-labelledby="tip-generator">
        <div className="section-heading">
          <p className="eyebrow">Random tip</p>
          <h2 id="tip-generator">Generate your next move</h2>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        <TipCard tip={activeTip} onGenerateTip={handleGenerateTip} />
      </section>

      <TipsPreview tips={tips} />
    </main>
  );
}
