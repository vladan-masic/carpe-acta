/** Small decorative sketches, with the same ink-and-wash vocabulary as stamps.
 * No text or state is encoded in the artwork. */
export function NotebookIllustration({ motif = "page" }: { motif?: "page" | "bookmark" | "path" }) {
  return <svg className={`notebook-illustration sketch-${motif}`} viewBox="0 0 160 112" width="160" height="112" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path className="sketch-wash" d="M28 32C42 12 95 8 123 33c29 23 15 55-11 62-24 10-76 5-91-19-8-14-4-30 7-44Z" />
    {motif === "path" ? <>
      <path className="sketch-leaf" d="M17 83q30-25 63-7 28-24 62 2l-12 15-89 5Z" />
      <path className="sketch-ink" d="M17 83q30-25 63-7 28-24 62 2" />
      <path className="sketch-paper" d="M102 66c-65 11 25 18-20 35H62c53-18-27-23 40-35Z" />
      <path className="sketch-ink" d="M102 66c-65 11 25 18-20 35M41 79l-2-26m1 13-11-9m11 7 9-14" />
      <path className="sketch-leaf sketch-ink" d="M39 64c-14-2-17-12-14-16 12 1 16 9 14 16Zm1-7c-1-12 8-18 15-17 1 11-5 17-15 17Z" />
      <circle className="sketch-sun" cx="111" cy="34" r="12" />
    </> : <>
      <path className="sketch-paper sketch-ink" d="m36 28 36-5 8 6 41-2-5 57-38 1-37 7Z" />
      <path className="sketch-ink" d="m78 30 0 55m-41 9 41-5 39-2m-72-50 22-3m-22 12 16-2m-15 11 18-2m-17 11 12-1" />
      {motif === "bookmark" ? <>
        <path className="sketch-ribbon sketch-ink" d="m96 27 13 0-1 30-7-5-6 5Z" />
        <path className="sketch-pencil" d="m90 69 17-1m-18 8 13-1" />
      </> : <>
        <path className="sketch-pencil" d="M88 55c-2-10 17-16 20-4 3 9-9 17-16 9" />
        <path className="sketch-ribbon sketch-ink" d="m111 82 18-48 6 3-18 48-8 6Z" />
        <path className="sketch-pencil" d="m132 38-18 45m-5 8 8-6" />
      </>}
      <path className="sketch-leaf sketch-ink" d="M29 81c-12-3-15-12-12-18 11 1 16 9 12 18Zm2-7c-3-13 4-21 12-22 3 10-1 20-12 22Z" />
      <path className="sketch-ink" d="m32 94-4-20m3 6 7-18" />
    </>}
    <path className="sketch-pencil" d="M24 101q49 5 101-2m-86 6 51-1" />
  </svg>;
}
