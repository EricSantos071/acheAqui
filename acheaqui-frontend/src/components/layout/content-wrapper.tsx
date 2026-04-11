import { cn } from "@/lib/utils";

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function ContentWrapper({
  children,
  className,
  narrow = false,
}: ContentWrapperProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-6 lg:px-16 xl:px-20",
        narrow ? "max-w-narrow" : "max-w-site",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      {children}
    </section>
  );
}
