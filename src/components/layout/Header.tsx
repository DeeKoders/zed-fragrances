"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { CartButton } from "@/components/cart/CartButton";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

const SCROLL_THRESHOLD = 24;

function subscribeToScroll(onScroll: () => void) {
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

function useScrolledPast(threshold: number) {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

const linkClass =
  "relative text-label uppercase text-ivory-muted transition-colors hover:text-gold-200 focus-visible:text-gold-200 after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold-400 after:transition-transform after:duration-500 after:ease-lux hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function Header() {
  const scrolled = useScrolledPast(SCROLL_THRESHOLD);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
        scrolled || menuOpen ? "border-line bg-ink-950/80 backdrop-blur-md" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-10">
        <Logo eager sizes="(min-width: 768px) 128px, 96px" className="w-24 md:w-32" />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {brand.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <CartButton />

          <button
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
            className="px-3 py-3 text-label uppercase text-ivory md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <nav
        id={menuId}
        aria-label="Mobile"
        hidden={!menuOpen}
        className="border-t border-line px-5 pb-8 pt-6 md:hidden"
      >
        <ul className="flex flex-col gap-6">
          {brand.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-h3 uppercase text-ivory transition-colors hover:text-gold-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
