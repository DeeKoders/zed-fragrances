// Motion tokens shared by GSAP, Motion and CSS. Keep the eases in sync with --ease-* in globals.css.

/** Seconds. */
export const duration = {
  micro: 0.16,
  ui: 0.4,
  reveal: 0.9,
  theme: 0.8,
  preloader: 1.8,
} as const;

/** Seconds between items. */
export const stagger = { chars: 0.04, lines: 0.08 } as const;

/** lux: reveals. silk: theme changes and curtains. */
export const easeCss = {
  lux: "cubic-bezier(0.16, 1, 0.3, 1)",
  silk: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/** The same curves for Motion (`transition.ease`). */
export const ease = {
  lux: [0.16, 1, 0.3, 1],
  silk: [0.65, 0, 0.35, 1],
} as const;

/** Closest GSAP built-ins. */
export const gsapEase = { lux: "expo.out", silk: "power3.inOut" } as const;

export const spring = {
  /** Quick UI feedback. */
  snap: { type: "spring", stiffness: 420, damping: 32 },
  /** Magnetic buttons and the cursor ring. */
  magnet: { type: "spring", stiffness: 160, damping: 14, mass: 0.6 },
} as const;
