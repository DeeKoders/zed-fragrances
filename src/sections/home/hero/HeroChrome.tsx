import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/** Darkens the top of the hero so the transparent header stays readable over any world. */
export function HeroScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-36 bg-linear-to-b from-ink-950/80 to-transparent"
    />
  );
}

export function ScrollCue({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-enter="fade"
      className={cn(
        "pointer-events-none absolute bottom-6 left-1/2 z-[4] -translate-x-1/2 flex-col items-center gap-3 pl-[0.48em] text-micro uppercase text-ivory-muted",
        className,
      )}
    >
      {brand.copy.hero.scroll}
      <span className="relative block h-10 w-px overflow-hidden bg-gold-800">
        <span className="scroll-cue-dot absolute inset-x-0 top-0 h-1/3 bg-gold-300" />
      </span>
    </div>
  );
}
