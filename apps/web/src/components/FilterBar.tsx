import { useMemo, useState } from "react";
import type { FeedFilter, FeedItem } from "../types/content";
import { VideoCard } from "./VideoCard";

const TABS: { id: FeedFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sections", label: "Sections" },
  { id: "brands", label: "Brands" },
  { id: "marketing", label: "Marketing" },
  { id: "components", label: "Components" },
];

type InspirationFeedProps = {
  items: FeedItem[];
  initialFilter?: FeedFilter;
  showCopyOnComponents?: boolean;
};

export function InspirationFeed({
  items,
  initialFilter = "all",
  showCopyOnComponents = false,
}: InspirationFeedProps) {
  const [active, setActive] = useState<FeedFilter>(initialFilter);

  const visible = useMemo(() => {
    if (active === "all") return items;
    return items.filter((item) => item.filter === active);
  }, [active, items]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`godly-pill ${active === tab.id ? "godly-pill-active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-400">
          No inspiration in this category yet. Ingest content in PayloadCMS to
          populate the gallery.
        </p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visible.map((item) => (
            <div key={item.key} className="mb-4 break-inside-avoid">
              <VideoCard
                title={item.title}
                subtitle={item.subtitle}
                videoUrl={item.videoUrl}
                posterUrl={item.posterUrl}
                imageUrl={item.imageUrl}
                href={item.href}
                promptText={item.promptText}
                library={item.library}
                showCopy={
                  showCopyOnComponents && item.filter === "components"
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterBar({
  active,
  onChange,
}: {
  active: FeedFilter;
  onChange: (next: FeedFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`godly-pill ${active === tab.id ? "godly-pill-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
