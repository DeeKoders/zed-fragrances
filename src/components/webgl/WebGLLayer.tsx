"use client";

import dynamic from "next/dynamic";
import { useWebGLReady } from "@/hooks/useWebGLReady";

const Atmosphere = dynamic(() => import("./Atmosphere"), { ssr: false });

/** Loads the WebGL atmosphere once the browser is idle after the intro. The static fallback stays beneath. */
export function WebGLLayer() {
  const ready = useWebGLReady();
  return ready ? <Atmosphere /> : null;
}
