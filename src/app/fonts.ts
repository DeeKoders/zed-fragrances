import { Cinzel, Cormorant_Garamond, Manrope } from "next/font/google";

/** Display: names, headings, kinetic type. */
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });

/** Editorial accents, italic only. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Body and UI. */
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const fontVariables = [cinzel.variable, cormorant.variable, manrope.variable].join(" ");
