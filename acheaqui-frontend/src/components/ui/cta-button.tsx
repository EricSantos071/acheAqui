import Link from "next/link";
import { Button } from "@/components/ui";
import type { CTAConfig } from "@/types/page-config";

const sizeMap = {
  small: "sm",
  medium: "default",
  large: "lg",
} as const;

interface CTAButtonProps {
  cta: CTAConfig;
  size?: "small" | "medium" | "large";
  defaultVariant?: "default" | "secondary" | "outline" | "ghost" | "link";
}

export function CTAButton({ cta, size = "medium", defaultVariant = "default" }: CTAButtonProps) {
  const variant = cta.variant || defaultVariant;
  const mappedSize = sizeMap[size];

  if (cta.external) {
    return (
      <Button variant={variant} size={mappedSize} asChild>
        <a href={cta.href} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      </Button>
    );
  }

  if (cta.href.startsWith("#")) {
    return (
      <Button variant={variant} size={mappedSize} asChild>
        <a href={cta.href}>{cta.label}</a>
      </Button>
    );
  }

  return (
    <Button variant={variant} size={mappedSize} asChild>
      <Link href={cta.href}>{cta.label}</Link>
    </Button>
  );
}
