import { parseWebinarUrl } from "@/lib/webinar-platforms";

interface WebinarPlatformBadgeProps {
  url: string;
}

/**
 * Displays the detected webinar platform as a small badge
 * with a link to join or register on the platform.
 */
export function WebinarPlatformBadge({ url }: WebinarPlatformBadgeProps) {
  const { displayName, joinUrl, platform } = parseWebinarUrl(url);

  const actionLabel =
    platform === "gotowebinar" || platform === "livestorm" || platform === "demio"
      ? "Register"
      : "Join";

  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
        {displayName}
      </span>
      <a
        href={joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        {actionLabel} on {displayName}
      </a>
    </div>
  );
}
