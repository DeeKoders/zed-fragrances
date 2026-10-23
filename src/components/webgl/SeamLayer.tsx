"use client";

import dynamic from "next/dynamic";
import { useWebGLReady } from "@/hooks/useWebGLReady";
import type { SeamState } from "./SeamCanvas";

const SeamCanvas = dynamic(() => import("./SeamCanvas"), { ssr: false });

/** Lazy shader seam for the split hero. Until it loads (or without WebGL) the CSS seam line shows. */
export function SeamLayer({ slugs, state }: { slugs: [string, string]; state: SeamState }) {
  const ready = useWebGLReady();
  return ready ? <SeamCanvas slugs={slugs} state={state} /> : null;
}
