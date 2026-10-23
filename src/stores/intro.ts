import { create } from "zustand";

/**
 * pending: not known yet (server render, before hydration).
 * playing: the preloader covers the page.
 * revealing: the curtain is opening; start entrance animations now.
 * done: nothing covers the page (finished, skipped, or not played this session).
 */
export type IntroStatus = "pending" | "playing" | "revealing" | "done";

const ORDER: IntroStatus[] = ["pending", "playing", "revealing", "done"];

type IntroState = {
  status: IntroStatus;
  /** Only moves forward, so a late signal can't rewind the intro. */
  advance: (next: IntroStatus) => void;
};

export const useIntro = create<IntroState>()((set) => ({
  status: "pending",
  advance: (next) =>
    set((state) => (ORDER.indexOf(next) > ORDER.indexOf(state.status) ? { status: next } : state)),
}));
