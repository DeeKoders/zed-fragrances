"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { HOUSE_THEME, type ThemeMeta } from "@/lib/theme/types";

type ThemeContextValue = {
  themes: ThemeMeta[];
  /** The world on screen: a preview wins over the base theme. */
  active: string;
  /** The world the page has settled on (scroll position, product page, scent-finder result). */
  base: string;
  setTheme: (id: string) => void;
  /** Temporary override while a product is hovered or focused. Pass null to release it. */
  previewTheme: (id: string | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Holds the active product world. Switching only changes [data-theme] on <html>; the generated
 * stylesheet and registered CSS properties do the ~800ms colour morph across the whole site.
 */
export function ThemeProvider({ themes, children }: { themes: ThemeMeta[]; children: ReactNode }) {
  const [base, setBase] = useState(HOUSE_THEME);
  const [preview, setPreview] = useState<string | null>(null);
  const active = preview ?? base;

  useEffect(() => {
    document.documentElement.dataset.theme = active;
  }, [active]);

  const isKnown = useCallback((id: string) => themes.some((theme) => theme.id === id), [themes]);

  const setTheme = useCallback(
    (id: string) => {
      if (isKnown(id)) setBase(id);
    },
    [isKnown],
  );

  const previewTheme = useCallback(
    (id: string | null) => setPreview(id !== null && isKnown(id) ? id : null),
    [isKnown],
  );

  const value = useMemo(
    () => ({ themes, active, base, setTheme, previewTheme }),
    [themes, active, base, setTheme, previewTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>.");
  return context;
}
