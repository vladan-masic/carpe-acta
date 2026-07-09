import type { Tip } from "../types/tip";

type TipsPreviewProps = {
  tips: Tip[];
};

export function TipsPreview({ tips }: TipsPreviewProps) {
  return (
    <section className="tips-preview" aria-labelledby="tips-preview-title">
      <div className="section-heading">
        <p className="eyebrow">Content base</p>
        <h2 id="tips-preview-title">Browse starter tips</h2>
      </div>

      <div className="tips-grid">
        {tips.slice(0, 6).map((tip) => (
          <article className="preview-card" key={tip.id}>
            <span>{tip.category}</span>
            <h3>{tip.title}</h3>
            <p>{tip.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
