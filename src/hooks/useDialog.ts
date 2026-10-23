"use client";

import { useEffect, type RefObject } from "react";
import { useLenis } from "@/providers/SmoothScroll";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for drawers and lightboxes: focus moves in and is trapped, Escape closes, page
 * scroll is locked (Lenis and native), and focus returns to the opener on close.
 * Pass a stable `onClose`.
 */
export function useDialog(open: boolean, panel: RefObject<HTMLElement | null>, onClose: () => void) {
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const smooth = lenis.current;
    smooth?.stop();
    root.dataset.scrollLock = "";

    const focusables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const frame = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      smooth?.start();
      delete root.dataset.scrollLock;
      previous?.focus();
    };
  }, [open, panel, onClose, lenis]);
}
