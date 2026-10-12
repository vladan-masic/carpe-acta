import emblem from "../assets/branding/emblem.png";

type BrandEmblemProps = {
  variant: "hero" | "footer" | "dialog";
};

// The emblem is decorative; adjacent headings supply the accessible context.
export function BrandEmblem({ variant }: BrandEmblemProps) {
  return (
    <img
      className={`brand-emblem brand-emblem--${variant}`}
      src={emblem}
      width={192}
      height={192}
      alt=""
    />
  );
}
