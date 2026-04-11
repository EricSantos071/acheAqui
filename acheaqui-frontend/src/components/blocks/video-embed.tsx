import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";

export interface VideoEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export function VideoEmbed({ url, title = "Video", className }: VideoEmbedProps) {
  const videoId = extractYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className={cn("aspect-video w-full rounded-lg overflow-hidden border border-border", className)}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

export interface VideoSectionProps {
  url: string;
  title?: string;
  subtitle?: string;
  videoTitle?: string;
  className?: string;
}

export function VideoSection({
  url,
  title,
  subtitle,
  videoTitle,
  className,
}: VideoSectionProps) {
  return (
    <Section className={className}>
      <ContentWrapper>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <VideoEmbed url={url} title={videoTitle || title} />
        </div>
      </ContentWrapper>
    </Section>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}
