"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

type SplitHeadingProps = {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
};

/**
 * A heading whose words rise out of masks when it scrolls into view. The hidden pose only applies
 * once scripts mark it ready, so the text never goes missing; reduced motion shows it at rest.
 */
export function SplitHeading({ text, as: Tag = "h2", id, className }: SplitHeadingProps) {
  const root = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");

  useEffect(() => {
    const element = root.current;
    if (!element || reducedMotion) return;
    element.setAttribute("data-split", "ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.setAttribute("data-split", "in");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeAttribute("data-split");
    };
  }, [reducedMotion]);

  return (
    <Tag ref={root} id={id} className={cn("split-heading", className)}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span className="split-word inline-block" style={{ "--i": index } as CSSProperties}>
              {word}
            </span>
          </span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
