/**
 * Webinar platform detection and URL parsing.
 *
 * Given a webinar URL, determines the hosting platform and
 * returns structured metadata including display name and join/embed URLs.
 */

export interface WebinarPlatformInfo {
  platform: string;
  displayName: string;
  joinUrl: string;
  embedUrl?: string;
}

interface PlatformMatcher {
  platform: string;
  displayName: string;
  matches: (hostname: string, pathname: string) => boolean;
  getEmbedUrl?: (url: URL) => string;
}

const platformMatchers: PlatformMatcher[] = [
  {
    platform: "zoom",
    displayName: "Zoom",
    matches: (hostname) =>
      hostname === "zoom.us" || hostname.endsWith(".zoom.us"),
  },
  {
    platform: "gotowebinar",
    displayName: "GoToWebinar",
    matches: (hostname) =>
      hostname === "register.gotowebinar.com" ||
      hostname === "attendee.gotowebinar.com",
  },
  {
    platform: "teams",
    displayName: "Microsoft Teams",
    matches: (hostname) =>
      hostname === "teams.microsoft.com" || hostname === "teams.live.com",
  },
  {
    platform: "webex",
    displayName: "Webex",
    matches: (hostname) => hostname.endsWith(".webex.com"),
  },
  {
    platform: "google-meet",
    displayName: "Google Meet",
    matches: (hostname) => hostname === "meet.google.com",
  },
  {
    platform: "youtube-live",
    displayName: "YouTube Live",
    matches: (hostname, pathname) =>
      (hostname === "youtube.com" || hostname === "www.youtube.com") &&
      pathname.startsWith("/live/"),
    getEmbedUrl: (url) => {
      const videoId = url.pathname.replace("/live/", "").split("/")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    },
  },
  {
    platform: "youtube-live",
    displayName: "YouTube Live",
    matches: (hostname) => hostname === "youtu.be",
    getEmbedUrl: (url) => {
      const videoId = url.pathname.slice(1).split("/")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    },
  },
  {
    platform: "livestorm",
    displayName: "Livestorm",
    matches: (hostname) =>
      hostname === "livestorm.co" || hostname.endsWith(".livestorm.co"),
  },
  {
    platform: "demio",
    displayName: "Demio",
    matches: (hostname) =>
      hostname === "demio.com" || hostname.endsWith(".demio.com"),
  },
  {
    platform: "crowdcast",
    displayName: "Crowdcast",
    matches: (hostname) =>
      hostname === "crowdcast.io" || hostname.endsWith(".crowdcast.io"),
  },
  {
    platform: "streamyard",
    displayName: "StreamYard",
    matches: (hostname) =>
      hostname === "streamyard.com" || hostname.endsWith(".streamyard.com"),
  },
];

/**
 * Parses a webinar URL and returns platform information.
 *
 * Detects the hosting platform from the URL hostname, extracts
 * relevant metadata, and optionally computes an embed URL for
 * platforms that support embedding (currently YouTube Live).
 */
export function parseWebinarUrl(url: string): WebinarPlatformInfo {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      platform: "other",
      displayName: "Other",
      joinUrl: url,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  for (const matcher of platformMatchers) {
    if (matcher.matches(hostname, pathname)) {
      const result: WebinarPlatformInfo = {
        platform: matcher.platform,
        displayName: matcher.displayName,
        joinUrl: url,
      };

      if (matcher.getEmbedUrl) {
        result.embedUrl = matcher.getEmbedUrl(parsed);
      }

      return result;
    }
  }

  return {
    platform: "other",
    displayName: "Other",
    joinUrl: url,
  };
}
