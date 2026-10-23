"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { quiz } from "@/data/quiz";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { productHref } from "@/lib/routes";
import { rankProducts } from "@/lib/scent-finder";
import { useTheme } from "@/providers/ThemeProvider";
import { ChapterOrder } from "../worlds/ChapterOrder";

const copy = brand.copy.finder;

const slide = {
  initial: { opacity: 0, x: 48 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -48 },
  transition: { duration: 0.6, ease: ease.lux },
};

/**
 * A short quiz that scores every product by mood tags, seasons, occasions and warmth, then reveals
 * the match with a full-site theme takeover: an accent burst from the last choice while the whole
 * site morphs into the product's world.
 */
export function ScentFinder() {
  const titleId = useId();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const burst = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const { setTheme } = useTheme();
  const reducedMotion = useReducedMotion();

  const step = answers.length;
  const finished = started && step >= quiz.length;
  const result = useMemo(() => (finished ? rankProducts(products, quiz, answers)[0] : undefined), [finished, answers]);

  // Each new question (or the result) takes focus as it mounts, so keyboard and screen reader users follow along.
  const focusOnMount = useCallback((node: HTMLHeadingElement | null) => node?.focus({ preventScroll: true }), []);

  // The takeover: theme morph plus a burst in the winner's accent from the last choice.
  useEffect(() => {
    if (!result) return;
    setTheme(result.product.slug);
    const element = burst.current;
    if (!element || reducedMotion) return;
    const { x, y } = origin.current;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const tween = gsap.fromTo(
      element,
      { x, y, scale: 0, opacity: 0.95 },
      { scale: radius / 50, opacity: 0, duration: 1.4, ease: "power3.out" },
    );
    return () => {
      tween.kill();
    };
  }, [result, reducedMotion, setTheme]);

  const choose = (option: number, event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    origin.current = { x: event.clientX || rect.left + rect.width / 2, y: event.clientY || rect.top + rect.height / 2 };
    setAnswers((current) => [...current, option]);
  };

  const restart = () => {
    setAnswers([]);
    setStarted(true);
  };

  const question = quiz[step];

  return (
    <section
      id="finder"
      aria-labelledby={titleId}
      data-theme={result?.product.slug}
      className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-micro uppercase text-gold-400">{copy.eyebrow}</p>
            <h2 id={titleId} className="mt-4 font-display text-h2 uppercase">
              {copy.title}
            </h2>
          </div>
          {started && !finished && (
            <p className="text-label uppercase text-ivory-muted tabular-nums" aria-live="polite">
              {copy.step} {step + 1} {copy.of} {quiz.length}
            </p>
          )}
        </div>

        {started && (
          <div aria-hidden className="mt-8 flex gap-1.5">
            {quiz.map((_, index) => (
              <span key={index} className="relative h-0.5 flex-1 overflow-hidden bg-line">
                <span
                  className={cn(
                    "absolute inset-0 origin-left bg-gold-400 transition-transform duration-700 ease-lux",
                    index < step || finished ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
            ))}
          </div>
        )}

        <div className="mt-12 min-h-[28rem]">
          <AnimatePresence mode="wait" initial={false}>
            {!started && (
              <motion.div key="intro" {...slide}>
                <p className="max-w-xl font-editorial text-editorial italic text-ivory-muted">{copy.intro}</p>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="mt-10 inline-flex items-center gap-3 bg-accent px-6 py-4 text-label uppercase text-on-accent transition-colors hover:bg-accent-600"
                >
                  {copy.start}
                  <span aria-hidden className="size-1.5 rotate-45 bg-on-accent" />
                </button>
              </motion.div>
            )}

            {question && started && (
              <motion.div key={`step-${step}`} {...slide}>
                <h3 ref={focusOnMount} tabIndex={-1} className="font-display text-h3 uppercase outline-none md:text-h2">
                  {question.question}
                </h3>
                <div className={cn("mt-8 grid gap-3 sm:grid-cols-2", question.options.length > 2 && "lg:grid-cols-4")}>
                  {question.options.map((option, index) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={(event) => choose(index, event)}
                      className="group relative flex min-h-36 flex-col justify-between overflow-hidden border border-line bg-ink-900/70 p-5 text-left transition-[border-color,translate] duration-500 ease-lux hover:-translate-y-1 hover:border-accent-border"
                    >
                      <span aria-hidden className="finder-option-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                      <span className="relative font-display text-xl uppercase tracking-[0.08em] text-ivory">{option.label}</span>
                      {option.hint && <span className="relative mt-4 text-sm text-ivory-muted">{option.hint}</span>}
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnswers((current) => current.slice(0, -1))}
                    className="mt-8 text-label uppercase text-ivory-muted transition-colors hover:text-gold-200"
                  >
                    ← {copy.back}
                  </button>
                )}
              </motion.div>
            )}

            {result && (
              <motion.div key="result" {...slide} className="grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
                <div>
                  <p className="text-micro uppercase text-accent-ink">{copy.resultEyebrow}</p>
                  <h3 ref={focusOnMount} tabIndex={-1} className="mt-4 font-display text-h1 uppercase outline-none">
                    <span className="text-accent-fill">{result.product.name}</span>
                  </h3>
                  <p className="mt-3 font-editorial text-editorial italic text-ivory-muted">{result.product.tagline}</p>
                  <p className="mt-6 text-label uppercase text-gold-300 tabular-nums">
                    {result.match}% {copy.match}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={productHref(result.product.slug)}
                      data-cursor="view"
                      className="inline-flex items-center border border-accent-border px-4 py-3 text-label uppercase text-ivory transition-colors hover:bg-accent hover:text-on-accent"
                    >
                      {`${brand.copy.hero.cta} ${result.product.name}`}
                    </Link>
                    <ChapterOrder product={result.product} />
                  </div>
                  <button
                    type="button"
                    onClick={restart}
                    className="mt-6 text-label uppercase text-ivory-muted transition-colors hover:text-gold-200"
                  >
                    ↺ {copy.restart}
                  </button>
                </div>
                <FloatingBottle
                  product={result.product}
                  sizes="14rem"
                  className="mx-auto h-[min(52svh,28rem)]"
                />
                <NotesPyramid product={result.product} className="max-w-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        ref={burst}
        aria-hidden
        data-theme={result?.product.slug}
        className="finder-burst pointer-events-none fixed left-0 top-0 z-[45] -ml-[50px] -mt-[50px] size-[100px] rounded-full opacity-0"
      />
    </section>
  );
}
