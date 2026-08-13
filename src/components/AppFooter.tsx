type AppFooterProps = {
  backToTopLabel: string;
  createdByLabel: string;
  motto: string;
};

export function AppFooter({
  backToTopLabel,
  createdByLabel,
  motto,
}: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-primary">
          <div>
            <p className="footer-brand">Carpe Acta</p>
            <p className="footer-motto">{motto}</p>
          </div>

          <a className="back-to-top" href="#page-top">
            {backToTopLabel}
            <svg aria-hidden="true" fill="none" viewBox="0 0 12 12">
              <path d="M6 10.5v-9M2.5 5 6 1.5 9.5 5" />
            </svg>
          </a>
        </div>

        <div className="footer-meta">
          <p>© {currentYear} Carpe Acta</p>
          <p>
            {createdByLabel}{" "}
            <a
              href="https://github.com/vladan-masic"
              rel="noopener noreferrer"
              target="_blank"
            >
              Vladan Masic
              <svg aria-hidden="true" fill="none" viewBox="0 0 12 12">
                <path d="M4.25 2h5.75v5.75M10 2 5.5 6.5M8.5 6.5V10h-6V4h3.5" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
