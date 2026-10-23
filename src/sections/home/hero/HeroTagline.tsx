import { Fragment } from "react";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/** The page's <h1>: brand name for assistive tech, the primary tagline revealed word by word. */
export function HeroTagline({ id, className }: { id: string; className?: string }) {
  const words = brand.taglines.primary.split(" ");

  return (
    <div className={cn("pointer-events-none text-center", className)}>
      <h1
        id={id}
        className="mx-auto max-w-[32rem] font-display text-[clamp(0.8125rem,1.4vw,1.25rem)] uppercase leading-relaxed tracking-[0.34em] text-ivory"
      >
        <span className="sr-only">{`${brand.name}: `}</span>
        {words.map((word, index) => (
          <Fragment key={index}>
            <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
              <span data-enter="word" className="inline-block">
                {word}
              </span>
            </span>
            {index < words.length - 1 && " "}
          </Fragment>
        ))}
      </h1>
      <div data-enter="fade">
        <DiamondDivider className="mx-auto mt-4 w-32 md:w-44" />
      </div>
    </div>
  );
}
