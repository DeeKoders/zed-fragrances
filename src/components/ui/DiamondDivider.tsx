import { cn } from "@/lib/cn";

/** Thin gold rule with a small diamond in the centre, as on the posters. */
export function DiamondDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold-400" />
      <span className="size-1.5 rotate-45 bg-gold-300" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold-400" />
    </div>
  );
}
