import emblem from "../assets/branding/emblem.png";

type BrandEmblemProps = {
  variant: "hero" | "footer";
};

// The adjacent brand name supplies the accessible text in both placements.
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
