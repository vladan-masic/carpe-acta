import { BrandEmblem } from "./BrandEmblem";

type AppFooterProps = {
  createdByLabel: string;
  motto: string;
};

export function AppFooter({
  createdByLabel,
  motto,
}: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-primary">
          <div>
            <div className="footer-brand-row">
              <BrandEmblem variant="footer" />
              <p className="footer-brand">Carpe Acta</p>
            </div>
            <p className="footer-motto">{motto}</p>
          </div>

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
