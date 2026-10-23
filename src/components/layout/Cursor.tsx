"use client";

import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { gsapEase } from "@/lib/motion";

const INTERACTIVE = "a, button, [role='button'], label, select, summary, [data-cursor]";
/** Text fields keep the native caret; the custom cursor hides over them. Mirrors globals.css. */
const TEXT_FIELD =
  "textarea, [contenteditable='true'], input:not([type='button'], [type='submit'], [type='reset'], [type='checkbox'], [type='radio'], [type='range'], [type='color'], [type='file'])";

type Label = keyof typeof brand.copy.cursor;
type CursorState = "idle" | "hover" | Label;

const isLabel = (value: string | null | undefined): value is Label =>
  value != null && Object.hasOwn(brand.copy.cursor, value);

/**
 * Gold dot plus a ring in the active accent (it morphs with the theme). The ring grows over
 * interactive elements and fills with a label over [data-cursor="view" | "order"]. Mouse only: off
 * on touch devices and with reduced motion. Moves by transform, outside React.
 */
export function Cursor() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [rootEl, ringEl, bodyEl, fillEl, labelEl, dotEl] = [
      root.current,
      ring.current,
      body.current,
      fill.current,
      label.current,
      dot.current,
    ];
    if (!enabled || !rootEl || !ringEl || !bodyEl || !fillEl || !labelEl || !dotEl) return;

    const html = document.documentElement;
    gsap.set([ringEl, dotEl], { xPercent: -50, yPercent: -50 });
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3.out" });
    const dotX = gsap.quickSetter(dotEl, "x", "px");
    const dotY = gsap.quickSetter(dotEl, "y", "px");

    let started = false;
    let shown = false;
    let inField = false;
    let pressed = false;
    let state: CursorState = "idle";

    const show = (visible: boolean) => {
      if (visible === shown) return;
      shown = visible;
      gsap.to(rootEl, { opacity: visible ? 1 : 0, duration: 0.25, overwrite: "auto" });
    };

    const render = () => {
      const labelled = isLabel(state);
      const scale = (labelled ? 2.2 : state === "hover" ? 1.5 : 1) * (pressed ? 0.85 : 1);
      gsap.to(bodyEl, { scale, duration: 0.5, ease: gsapEase.lux, overwrite: "auto" });
      gsap.to(fillEl, { opacity: labelled ? 1 : state === "hover" ? 0.18 : 0, duration: 0.3, overwrite: "auto" });
      gsap.to(labelEl, { opacity: labelled ? 1 : 0, duration: 0.25, overwrite: "auto" });
      gsap.to(dotEl, { opacity: labelled ? 0 : 1, duration: 0.2, overwrite: "auto" });
      if (labelled) labelEl.textContent = brand.copy.cursor[state as Label];
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return show(false);
      if (!started) {
        started = true;
        html.dataset.customCursor = "";
        gsap.set(ringEl, { x: event.clientX, y: event.clientY });
      }
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      show(!inField);
    };

    const onOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      inField = event.target.closest(TEXT_FIELD) !== null;
      const cue = event.target.closest("[data-cursor]")?.getAttribute("data-cursor");
      const next: CursorState = isLabel(cue) ? cue : event.target.closest(INTERACTIVE) ? "hover" : "idle";
      if (next !== state) {
        state = next;
        render();
      }
    };

    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) show(false);
    };
    const onPress = (down: boolean) => () => {
      pressed = down;
      render();
    };
    const onDown = onPress(true);
    const onUp = onPress(false);
    const onBlur = () => show(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onBlur);
      gsap.killTweensOf([rootEl, ringEl, bodyEl, fillEl, labelEl, dotEl]);
      delete html.dataset.customCursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[80] opacity-0">
      <div ref={ring} className="absolute left-0 top-0 size-10">
        <div ref={body} className="absolute inset-0">
          <span ref={fill} className="absolute inset-0 rounded-full bg-accent opacity-0" />
          <svg viewBox="0 0 40 40" className="absolute inset-0 size-full overflow-visible">
            <circle cx="20" cy="20" r="19.5" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" className="stroke-accent" />
          </svg>
        </div>
        <span
          ref={label}
          className="absolute inset-0 grid place-items-center pl-[0.24em] text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-on-accent opacity-0"
        />
      </div>
      <div ref={dot} className="absolute left-0 top-0 size-1.5 rounded-full bg-gold-300" />
    </div>
  );
}
