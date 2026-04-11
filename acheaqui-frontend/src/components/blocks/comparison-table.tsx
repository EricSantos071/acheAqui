import { Check, X } from "lucide-react";
import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { ComparisonColumnConfig, ComparisonRowConfig } from "@/types/page-config";

export type ComparisonColumn = ComparisonColumnConfig;
export type ComparisonRow = ComparisonRowConfig;

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
}

export function ComparisonTable({
  title,
  subtitle,
  columns,
  rows,
  className,
}: ComparisonTableProps) {
  return (
    <Section className={cn("py-16 md:py-24", className)}>
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
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-card">
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground py-6 px-6 w-[40%]">
                    Feature
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.name}
                      className={cn(
                        "text-center text-sm font-medium py-6 px-6",
                        col.highlight
                          ? "text-primary bg-primary/10"
                          : "text-foreground"
                      )}
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-t border-border",
                      rowIndex % 2 === 1 && "bg-background"
                    )}
                  >
                    <td className="text-sm text-foreground py-6 px-6 font-medium">
                      {row.feature}
                    </td>
                    {row.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn(
                          "text-center text-sm py-6 px-6",
                          columns[colIndex]?.highlight && "bg-primary/5"
                        )}
                      >
                        <CellValue value={value} highlight={columns[colIndex]?.highlight} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}

function CellValue({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded-full",
        highlight ? "bg-primary/20" : "bg-muted"
      )}>
        <Check
          size={14}
          strokeWidth={3}
          className={highlight ? "text-primary" : "text-muted-foreground"}
        />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/50">
        <X size={14} strokeWidth={2} className="text-muted-foreground" />
      </span>
    );
  }

  return (
    <span className={cn(
      "text-sm",
      highlight ? "text-foreground font-medium" : "text-muted-foreground"
    )}>
      {value}
    </span>
  );
}
