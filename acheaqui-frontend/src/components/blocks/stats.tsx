import { cn } from "@/lib/utils";
import type { StatConfig } from "@/types/page-config";

export type StatItem = StatConfig;

interface StatsProps {
  stats: StatItem[];
  className?: string;
}

export function Stats({ stats, className }: StatsProps) {
  if (!stats || stats.length === 0) return null;

  const gridCols = getGridCols(stats.length);

  return (
    <div className={cn("grid gap-8 text-center", gridCols, className)}>
      {stats.map((stat, index) => (
        <div key={index}>
          <p className="text-xl md:text-3xl font-medium text-foreground mb-2">
            {stat.value}
          </p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function getGridCols(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-3";
    case 4:
      return "grid-cols-2 md:grid-cols-4";
    case 5:
      return "grid-cols-2 md:grid-cols-5";
    case 6:
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
    default:
      return "grid-cols-2 md:grid-cols-4";
  }
}
