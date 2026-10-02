export function BackToTop({ label }: { label: string }) {
  return (
    <a className="back-to-top" href="#page-top" aria-label={label} title={label} onClick={() => {
      document.getElementById("page-top")?.focus({ preventScroll: true });
    }}>
      <svg aria-hidden="true" fill="none" viewBox="0 0 12 12">
        <path d="M6 10.5v-9M2.5 5 6 1.5 9.5 5" />
      </svg>
    </a>
  );
}
