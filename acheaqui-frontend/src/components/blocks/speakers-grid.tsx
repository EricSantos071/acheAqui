import Image from "next/image";

import type { SpeakerConfig } from "@/types/page-config";

interface SpeakersGridProps {
  speakers: SpeakerConfig[];
}

export function SpeakersGrid({ speakers }: SpeakersGridProps) {
  const gridCols =
    speakers.length === 1
      ? "max-w-sm mx-auto"
      : speakers.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-8 ${gridCols}`}>
      {speakers.map((speaker) => (
        <div
          key={speaker.name}
          className="flex flex-col items-center text-center p-6 rounded-md border border-border bg-background"
        >
          {speaker.avatar && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4">
              <Image
                src={speaker.avatar.src}
                alt={speaker.avatar.alt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <h3 className="text-lg font-medium text-foreground">{speaker.name}</h3>
          <p className="text-sm text-muted-foreground">
            {speaker.role}
            {speaker.company && `, ${speaker.company}`}
          </p>
          {speaker.bio && (
            <p className="mt-3 text-sm text-muted-foreground">{speaker.bio}</p>
          )}
        </div>
      ))}
    </div>
  );
}
