"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { brand } from "@/config/brand";
import { useNow } from "@/hooks/useNow";

const { dropBanner } = brand;
const copy = brand.copy.drop;

function Countdown({ to }: { to: string }) {
  const now = useNow();
  const target = Math.floor(new Date(to).getTime() / 1000);
  const left = now === null ? null : Math.max(0, target - now);
  if (left === 0) return null;

  const parts = [
    { label: copy.units.days, value: left === null ? null : Math.floor(left / 86400) },
    { label: copy.units.hours, value: left === null ? null : Math.floor((left % 86400) / 3600) },
    { label: copy.units.minutes, value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: copy.units.seconds, value: left === null ? null : left % 60 },
  ];

  return (
    <div className="mt-8">
      <p className="text-micro uppercase text-ivory-muted">{copy.endsIn}</p>
      <div role="timer" className="mt-3 flex justify-center gap-4 md:gap-6">
        {parts.map((part) => (
          <div key={part.label} className="min-w-14 text-center">
            <span className="block font-display text-h2 tabular-nums text-gold-metal">
              {part.value === null ? "--" : String(part.value).padStart(2, "0")}
            </span>
            <span className="text-micro uppercase text-ivory-muted">{part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** "First Batch Ready" drop banner, entirely driven by brand.dropBanner. */
export function DropBanner() {
  const titleId = useId();
  if (!dropBanner.enabled) return null;
  const { stock, countdownTo, image } = dropBanner;

  return (
    <section aria-labelledby={titleId} className="relative isolate overflow-hidden border-y border-line">
      {image && (
        <Image
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-40"
        />
      )}
      <div aria-hidden className="drop-scrim absolute inset-0 -z-10" />

      <div className="mx-auto max-w-4xl px-5 py-24 text-center md:py-36">
        <h2 id={titleId} className="font-display text-h1 uppercase text-gold-metal">
          {dropBanner.eyebrow}
        </h2>
        <DiamondDivider className="mx-auto mt-6 w-48" />
        <p className="mt-6 font-editorial text-editorial italic text-ivory">{dropBanner.text}</p>

        {stock && stock.total > 0 && (
          <div className="mx-auto mt-10 max-w-sm">
            <div
              role="meter"
              aria-label={`${stock.remaining} ${copy.stock}`}
              aria-valuemin={0}
              aria-valuemax={stock.total}
              aria-valuenow={stock.remaining}
              className="relative h-1 overflow-hidden bg-ink-700"
            >
              <span
                className="absolute inset-0 origin-left bg-gold-metal"
                style={{ transform: `scaleX(${Math.min(1, stock.remaining / stock.total)})` }}
              />
            </div>
            <p className="mt-3 text-label uppercase text-gold-200 tabular-nums">
              {stock.remaining} / {stock.total} {copy.stock}
            </p>
          </div>
        )}

        {countdownTo && <Countdown to={countdownTo} />}

        <Link
          href="/#collection"
          className="mt-12 inline-flex items-center gap-3 bg-gold-300 px-6 py-4 text-label uppercase text-ink-950 transition-colors hover:bg-gold-200"
        >
          {copy.cta}
          <span aria-hidden className="size-1.5 rotate-45 bg-ink-950" />
        </Link>
      </div>
    </section>
  );
}
