import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface SiteLogoProps {
  className?: string;
}

/**
 * Site logo with dark/light mode support, driven by siteConfig.logo.
 * If light and dark paths are the same, renders a single image.
 */
export function SiteLogo({ className }: SiteLogoProps) {
  const { logo, name } = siteConfig;
  const isSingleLogo = logo.light === logo.dark;

  if (isSingleLogo) {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src={logo.light}
          alt={name}
          width={Math.round(logo.height * 4)}
          height={logo.height}
          className="w-auto"
          style={{ height: `${logo.height}px` }}
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logo.light}
        alt={name}
        width={Math.round(logo.height * 4)}
        height={logo.height}
        className="w-auto dark:hidden"
        style={{ height: `${logo.height}px` }}
        priority
      />
      <Image
        src={logo.dark}
        alt={name}
        width={Math.round(logo.height * 4)}
        height={logo.height}
        className="w-auto hidden dark:block"
        style={{ height: `${logo.height}px` }}
        priority
      />
    </div>
  );
}
