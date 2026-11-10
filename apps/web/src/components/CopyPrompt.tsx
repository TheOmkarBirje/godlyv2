import { useCallback, useEffect, useState } from "react";

type CopyPromptProps = {
  text: string;
  label?: string;
};

export function CopyPrompt({ text, label = "Copy prompt" }: CopyPromptProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [text]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void copy()}
        className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
      >
        {label}
      </button>

      {copied ? (
        <div
          role="status"
          className="absolute right-0 top-[-2.4rem] z-20 whitespace-nowrap rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-200 shadow-lg"
        >
          Copied MCP prompt
        </div>
      ) : null}
    </div>
  );
}
