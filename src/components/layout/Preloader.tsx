"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/config/brand";
import { useIntro } from "@/stores/intro";

/** Playback rate once the visitor clicks, taps, types or scrolls: wraps up fast, no hard cut. */
const SKIP_RATE = 4;
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

/** Widest the wordmark renders here (28rem), so the mask's 2x candidate covers retina screens. */
const LOGO_MAX_PX = 448;

/**
 * Gold mask reveal of the official wordmark, the diamond rule, then a curtain that splits on the
 * rule. The choreography is CSS (.preloader* in globals.css) so it starts at first paint and stays
 * smooth while the page hydrates. This component syncs to it through the Web Animations API,
 * publishes the intro status for the hero, and removes itself once done.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const status = useIntro((state) => state.status);
  const advance = useIntro((state) => state.advance);

  useEffect(() => {
    const html = document.documentElement;
    const element = root.current;
    const top = curtain.current;
    if (html.dataset.intro !== "play" || !element || !top) {
      advance("done");
      return;
    }

    advance("playing");
    const animations = element.getAnimations({ subtree: true });
    let active = true;

    const skip = () => animations.forEach((animation) => animation.updatePlaybackRate(SKIP_RATE));
    const onCurtainStart = (event: AnimationEvent) => {
      if (event.target === top) advance("revealing");
    };
    const release = () => {
      active = false;
      top.removeEventListener("animationstart", onCurtainStart);
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
    };
    const finish = () => {
      if (!active) return;
      release();
      html.dataset.intro = "done";
      advance("done");
    };

    // Hydration can land before or after the curtain starts to open.
    const opening = top.getAnimations()[0];
    const delay = Number(opening?.effect?.getTiming().delay ?? 0);
    if (opening && Number(opening.currentTime) >= delay) advance("revealing");
    else top.addEventListener("animationstart", onCurtainStart);

    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { passive: true }));
    // `finished` rejects if an animation is cancelled (e.g. the failsafe hid the preloader).
    Promise.all(animations.map((animation) => animation.finished)).then(finish, finish);

    return release;
  }, [advance]);

  if (status === "done") return null;

  const { width, height, src } = brand.logo.wordmark;
  const mask = getImageProps({
    src,
    width: LOGO_MAX_PX,
    height: Math.round((LOGO_MAX_PX * height) / width),
    alt: "",
  }).props.src;

  return (
    <div ref={root} aria-hidden className="preloader fixed inset-0 z-[55]">
      <div
        ref={curtain}
        className="preloader-top absolute inset-x-0 top-0 flex h-1/2 items-end justify-center bg-ink-950 pb-[clamp(2rem,6svh,4rem)]"
      >
        <span data-edge="bottom" className="preloader-glow absolute inset-0" />
        <div className="relative w-[min(72vw,28rem,75svh)]">
          <Logo href={null} eager sizes="(min-width: 640px) 28rem, 72vw" />
          <span className="preloader-shine absolute inset-0" style={{ maskImage: `url("${mask}")` }}>
            <span className="preloader-shine-band absolute inset-y-0 left-0 w-[35%]" />
          </span>
          <span className="preloader-cover absolute inset-y-0" />
        </div>
        <span className="preloader-rule absolute inset-x-0 bottom-0 h-px bg-gold-rule" />
      </div>

      <div className="preloader-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink-950">
        <span data-edge="top" className="preloader-glow absolute inset-0" />
        <span className="preloader-rule absolute inset-x-0 top-0 h-px bg-gold-rule" />
      </div>

      <span className="preloader-diamond absolute left-1/2 top-1/2 size-2 -translate-1/2 rotate-45 bg-gold-300" />
    </div>
  );
}
