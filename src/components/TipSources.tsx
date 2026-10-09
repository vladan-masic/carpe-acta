import { habitSources, tipSources } from "../data/tipSources";
import type { Locale } from "../i18n/locales";
import type { TipId } from "../types/tip";

const messages = {
  en: { related: "Related reading", inspired: "Inspired by", read: "Read the source", independent: "Carpe Acta is an independent project and is not affiliated with or endorsed by these authors.", original: "This action and its wording were created for Carpe Acta." },
  "sr-Latn": { related: "Povezano štivo", inspired: "Inspirisano", read: "Pročitaj izvor", independent: "Carpe Acta je nezavisan projekat i nije povezan sa ovim autorima niti ima njihovu podršku.", original: "Ova radnja i njen tekst osmišljeni su za Carpe Acta." },
};

export function TipSources({ tipId, locale }: { tipId: TipId; locale: Locale }) {
  const references = tipSources[tipId];
  if (!references?.length) return null;
  const copy = messages[locale];
  return <div className="tip-sources" key={tipId}>
    {references.map(reference => {
      const source = habitSources[reference.source];
      const inspired = reference.relationship === "inspired-by";
      const prefix = inspired ? locale === "sr-Latn"
        ? `${copy.inspired} ${reference.source === "atomic-habits" ? "knjigom" : "metodom"}` : copy.inspired : copy.related;
      return <details key={reference.url}>
        <summary>{prefix} · {source.title} · {source.author}</summary>
        <p>{reference.explanation[locale]}</p>
        <a href={reference.url}>{copy.read}: {source.title} · {source.author}</a>
        <p className="source-note">{copy.independent}{inspired && ` ${copy.original}`}</p>
      </details>;
    })}
  </div>;
}
