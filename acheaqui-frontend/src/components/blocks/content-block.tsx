import { ContentWrapper, Section } from "@/components/layout";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { ContentBlockConfig } from "@/types/page-config";
import { isValidElement } from "react";

interface ContentBlockProps {
  config: ContentBlockConfig;
  className?: string;
}

export function ContentBlock({ config, className }: ContentBlockProps) {
  const { title, subtitle, items, columns = 3, variant = "default" } = config;

  return (
    <Section className={className}>
      <ContentWrapper>
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div
          className={cn(
            "grid gap-8",
            columns === 2 && "sm:grid-cols-2",
            columns === 3 && "sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {items.map((item, index) => (
            <ContentBlockItem
              key={index}
              item={item}
              variant={variant}
            />
          ))}
        </div>
      </ContentWrapper>
    </Section>
  );
}

interface ContentBlockItemProps {
  item: ContentBlockConfig["items"][number];
  variant: ContentBlockConfig["variant"];
}

function ContentBlockItem({ item, variant }: ContentBlockItemProps) {
  const { icon, title, description } = item;

  const renderIcon = (size: "sm" | "md" | "lg" = "md") => {
    if (!icon) return null;

    const iconSizes = { sm: 20, md: 24, lg: 32 };

    if (isValidElement(icon)) return icon;

    if (typeof icon === "string" && /^[a-z][a-z0-9-]*$/.test(icon)) {
      return <Icon name={icon} size={iconSizes[size]} />;
    }

    const textSizes = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };
    return <span className={textSizes[size]}>{icon}</span>;
  };

  if (variant === "cards") {
    return (
      <div className="p-6 rounded-md border border-border bg-background hover:border-input transition-colors">
        {icon && (
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
            {renderIcon("sm")}
          </div>
        )}
        <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
        <div className="text-muted-foreground">
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      </div>
    );
  }

  if (variant === "icons") {
    return (
      <div className="flex gap-4">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {renderIcon("sm")}
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
          <div className="text-muted-foreground">
            {typeof description === "string" ? <p>{description}</p> : description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {icon && renderIcon("lg")}
      <div className="w-12 my-3">
        <div className="h-px w-full bg-border relative">
          <div className="h-px w-1/3 bg-primary absolute left-0 top-0" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <div className="text-muted-foreground">
        {typeof description === "string" ? <p>{description}</p> : description}
      </div>
    </div>
  );
}
