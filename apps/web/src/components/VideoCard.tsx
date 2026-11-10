import { useRef, useState } from "react";
import type { ComponentLibraryRef } from "../types/content";
import { CopyPrompt } from "./CopyPrompt";

type VideoCardProps = {
  title: string;
  subtitle?: string;
  videoUrl?: string;
  posterUrl?: string;
  imageUrl?: string;
  href?: string;
  promptText?: string;
  library?: ComponentLibraryRef | null;
  showCopy?: boolean;
};

function CreatorBadge({ library }: { library: ComponentLibraryRef }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-300 backdrop-blur">
      {library.logoUrl ? (
        <img
          src={library.logoUrl}
          alt=""
          className="h-4 w-4 rounded-sm object-cover"
          loading="lazy"
        />
      ) : null}
      <span>{library.name}</span>
    </span>
  );
}

export function VideoCard({
  title,
  subtitle,
  videoUrl,
  posterUrl,
  imageUrl,
  href,
  promptText,
  library,
  showCopy = false,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEnter = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  const media = (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900"
      onMouseEnter={videoUrl ? handleEnter : undefined}
      onMouseLeave={videoUrl ? handleLeave : undefined}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/webm" />
        </video>
      ) : (
        <img
          src={imageUrl ?? posterUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}

      {library ? (
        <div className="absolute left-3 top-3">
          <CreatorBadge library={library} />
        </div>
      ) : null}

    </div>
  );

  const body = (
    <article className="godly-card group">
      {href ? (
        <a href={href} className="block">
          {media}
        </a>
      ) : (
        media
      )}

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>
            ) : null}
          </div>
          {showCopy && promptText ? <CopyPrompt text={promptText} /> : null}
        </div>
      </div>
    </article>
  );

  return body;
}
