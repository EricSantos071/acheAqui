import {
  MessageSquare,
  Search,
  Bug,
  Sparkles,
  Database,
  Layers,
  Zap,
  Shield,
  Clock,
  Users,
  Code,
  FileText,
  Mail,
  Globe,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  "message-square": MessageSquare,
  search: Search,
  bug: Bug,
  sparkles: Sparkles,
  database: Database,
  layers: Layers,
  zap: Zap,
  shield: Shield,
  clock: Clock,
  users: Users,
  code: Code,
  "file-text": FileText,
  mail: Mail,
  globe: Globe,
  settings: Settings,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Icon component that renders a Lucide icon by name.
 * Falls back to null if icon name is not found.
 * Uses strokeWidth 1.5 for a clean look.
 */
export function Icon({ name, className, size = 24, strokeWidth = 1.5 }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      className={cn("text-primary", className)}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
