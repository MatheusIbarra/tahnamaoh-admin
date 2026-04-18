import Image from "next/image";

const LOGO_SRC = "/branding/logo.png";
const NATURAL_WIDTH = 677;
const NATURAL_HEIGHT = 369;

type BrandLogoProps = {
  className?: string;
  /** Tailwind height class drives visual size; width follows aspect ratio */
  heightClass?: string;
  priority?: boolean;
};

export function BrandLogo({
  className = "",
  heightClass = "h-9",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="TáhNaMão"
      width={NATURAL_WIDTH}
      height={NATURAL_HEIGHT}
      priority={priority}
      className={`w-auto object-contain object-left ${heightClass} ${className}`.trim()}
    />
  );
}
