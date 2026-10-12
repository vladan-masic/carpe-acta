type Props = { kind: "actions" | "days" | "best" | "exploration"; earned?: boolean };

/** Decorative ink-and-wash miniatures. All achievement information stays in
 * adjacent localized text; the artwork never encodes a threshold or a streak. */
export function AchievementStamp({ kind, earned = true }: Props) {
  return <svg className={`achievement-stamp stamp-${kind}${earned ? "" : " stamp-ahead"}`} viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path className="stamp-paper" d="m18 8 17 2 13-3 17 2 16-1 20 7 7 18-1 16 4 16-5 19-3 17-21 6-16-1-15 4-18-6-17-1-8-19 2-17-3-16 5-18Z" />
    <path className="stamp-rim" d="m21 15 27-2 28 2 20 5 5 27 2 18-6 30-27 7-18 2-30-8-8-26 2-24Z" />
    <path className="stamp-pencil" d="m20 20-2 23m10 53 23 6m47-73 3 22M66 14l19 2" />
    {kind === "actions" && <>
      <path className="stamp-wash" d="M24 50c-8-22 23-31 40-24 25-6 41 22 29 48-9 25-44 24-64 8-12-9-13-22-5-32Z" />
      <path className="stamp-earth" d="M22 86q34-11 73 1l-9 7-47 2Z" />
      <path className="stamp-white stamp-ink" d="m28 45 28-5 7 4 23-2-4 40-27-1-24 6Z" />
      <path className="stamp-ink" d="m56 42-1 39m-26 7 26-4 28 1m-47-32 12-2m-12 8 10-2m-9 8 11-1m-10 7 8-1m17-17 12-1m-13 8 9-1" />
      <path className="stamp-gold stamp-ink" d="m69 74 17-43 5 2-16 43-7 6Z" />
      <path className="stamp-pencil" d="m87 33-16 42m-3 7 7-6m-4-2 4 2" />
      <path className="stamp-leaf" d="M32 39c-10-1-11-9-10-13 8 1 12 6 10 13Zm2-2c-2-10 4-14 9-16 1 8-2 14-9 16Z" />
      <path className="stamp-ink" d="m34 43-3-13m3 9 5-13" />
    </>}
    {kind === "days" && <>
      <path className="stamp-wash" d="M27 39c9-21 42-22 59-2 22 25 4 50-16 53-27 8-57-22-43-51Z" />
      <path className="stamp-earth" d="M24 91q33-12 73-1l-9 7-48 1Z" />
      <path className="stamp-clay stamp-ink" d="m43 73 34-2-6 23-22 1Z" />
      <path className="stamp-clay stamp-ink" d="m40 70 40-1-1 7-39 1Z" />
      <path className="stamp-leaf stamp-ink" d="M59 62C42 61 34 48 35 40c16-1 28 10 24 22Zm1-9c0-17 11-25 23-23 0 13-7 24-23 23Zm-1-14c-13-3-18-12-15-18 12 1 18 9 15 18Z" />
      <path className="stamp-ink" d="M59 71c-3-20 1-30-1-43m1 34L42 47m17 6 16-16" />
      <path className="stamp-pencil" d="m49 81 2 9m3-9 1 9m17-35 7-1m-45 23-7 3" />
      <path className="stamp-gold" d="M88 60c4-4 9 2 4 6-5 4-10-2-4-6Z" />
    </>}
    {kind === "best" && <>
      <path className="stamp-wash" d="M29 34c11-19 50-12 63 11 13 28-11 44-36 43-28 0-47-32-27-54Z" />
      <path className="stamp-gold" d="M48 51c-7-21 21-30 28-11 9 23-25 30-28 11Z" />
      <path className="stamp-ink" d="m59 23 1-6m18 11 4-5m3 20 7-1M43 29l-4-5m-6 19-7-1" />
      <path className="stamp-leaf" d="M20 76q18-27 43-8 12-21 35-2l-5 25-58 3Z" />
      <path className="stamp-ink" d="M21 77q21-22 42-8 15-20 33-5" />
      <path className="stamp-white" d="M63 67c-19 10 12 15 5 25H49c22-10-11-17 14-25Z" />
      <path className="stamp-pencil" d="M63 67c-19 10 12 15 5 25m-40-5 12 2m39-9 7 2" />
      <path className="stamp-ink" d="m27 69 2-13m0 7-5-4m5 1 5-5m55 27 1-10m0 4 4-3" />
    </>}
    {kind === "exploration" && <>
      <path className="stamp-wash" d="M24 36c14-17 49-15 62 3 22 18 9 50-17 54-27 6-62-28-45-57Z" />
      <path className="stamp-blue" d="m20 69 21-23 21 17 13-21 25 29-11 18-60-1Z" />
      <path className="stamp-ink" d="m20 69 21-23 21 17 13-21 25 29m-62-19 4 4 3-3m27-4 4 5 3-3" />
      <path className="stamp-leaf" d="M20 82q21-22 42-8 18-12 36 2l-11 20-55-1Z" />
      <path className="stamp-white" d="M68 66C30 79 84 81 60 97H42c35-14-21-18 26-31Z" />
      <path className="stamp-pencil" d="M68 66C30 79 84 81 60 97" />
      <path className="stamp-ink" d="m65 67 1-39" />
      <path className="stamp-gold stamp-ink" d="m57 29 25 1 5 5-6 5-25-1Z" />
      <path className="stamp-ink" d="m61 34 16 1m-51 42 1-10m-1 6-5-4m7 0 4-5" />
    </>}
  </svg>;
}
