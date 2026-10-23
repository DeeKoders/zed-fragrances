"use client";

import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { duration } from "@/lib/motion";
import { createLoop, createShaderLayer, easeInOutCubic, GLSL_NOISE, hexToRgb, mixRgb, type Rgb } from "@/lib/webgl";
import { useTheme } from "@/providers/ThemeProvider";
import { useAtmosphere } from "@/stores/atmosphere";

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec3 uAccent;
uniform vec3 uAlt;
uniform vec3 uGlow;
uniform vec3 uGold;
uniform float uCold;
${GLSL_NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.04;

  // Domain-warped smoke, drifting up and nudged by scroll.
  vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, -t * 2.0 + uScroll)), fbm(p * 1.4 + vec2(5.2, 1.3 - t * 1.6)));
  float smoke = smoothstep(0.42, 0.95, fbm(p * 2.0 + 1.8 * q + vec2(0.0, -t * 3.0 + uScroll * 1.5)));
  vec3 color = mix(uAlt, uAccent, smoke) * smoke * 0.5;

  // Soft light rays falling from above.
  float angle = atan(p.x, 1.4 - p.y);
  float rays = pow(noise(vec2(angle * 9.0, t * 3.0)), 3.0) * smoothstep(0.1, 1.0, uv.y);
  color += mix(uGold, uGlow, uCold) * rays * 0.16;

  // Drifting dust motes: gold when warm, glow-coloured when cold.
  vec2 grid = p * 16.0 + vec2(0.0, t * 6.0 - uScroll * 4.0);
  vec2 id = floor(grid);
  vec2 offset = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
  float mote = 1.0 - smoothstep(0.0, 0.08, length(fract(grid) - 0.5 - offset * 0.6));
  mote *= step(0.88, hash(id)) * (0.5 + 0.5 * sin(uTime * 1.3 + hash(id + 3.7) * 40.0));
  color += mix(uGold, uGlow, uCold) * mote * 0.7;

  // Keep the edges dark and cinematic.
  color *= 1.0 - smoothstep(0.25, 1.25, length(p));
  float alpha = clamp(max(color.r, max(color.g, color.b)) * 1.4, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

type Palette = { accent: Rgb; alt: Rgb; glow: Rgb; cold: number };

/**
 * Site-wide WebGL atmosphere: smoke, light rays and dust tinted by the active theme, morphing with
 * it over the theme duration. Sits over the static AtmosphereFallback. Rendered at a fraction of
 * the resolution with a capped pixel ratio; pauses while the tab is hidden or an opaque section
 * (useAtmosphereCover) fills the screen.
 */
export default function Atmosphere() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { themes, active } = useTheme();
  const target = useRef<{ from: Palette; to: Palette; start: number } | null>(null);

  useEffect(() => {
    const meta = themes.find((theme) => theme.id === active) ?? themes[0];
    if (!meta) return;
    const next: Palette = {
      accent: hexToRgb(meta.accent),
      alt: hexToRgb(meta.accentAlt),
      glow: hexToRgb(meta.glow),
      cold: meta.mood === "cold" ? 1 : 0,
    };
    const current = target.current;
    target.current = { from: current ? currentPalette(current, performance.now()) : next, to: next, start: performance.now() };
  }, [themes, active]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const layer = createShaderLayer(element, FRAGMENT, { maxDpr: 1, scale: 0.5 });
    if (!layer) return;
    const { gl, uniform } = layer;
    gl.uniform3fv(uniform("uGold"), hexToRgb(brand.palette.gold["400"]));

    const loop = createLoop(
      (time) => {
        layer.resize();
        const palette = target.current ? currentPalette(target.current, performance.now()) : null;
        if (palette) {
          gl.uniform3fv(uniform("uAccent"), palette.accent);
          gl.uniform3fv(uniform("uAlt"), palette.alt);
          gl.uniform3fv(uniform("uGlow"), palette.glow);
          gl.uniform1f(uniform("uCold"), palette.cold);
        }
        gl.uniform2f(uniform("uRes"), element.width, element.height);
        gl.uniform1f(uniform("uTime"), time);
        gl.uniform1f(uniform("uScroll"), window.scrollY / Math.max(1, window.innerHeight) * 0.15);
        layer.draw();
      },
      () => Object.keys(useAtmosphere.getState().covers).length === 0,
    );
    const unsubscribe = useAtmosphere.subscribe(loop.wake);
    // Reveal only while a live context renders; a lost context falls back to the static layer.
    const onLost = () => {
      delete element.dataset.ready;
      loop.stop();
    };
    element.addEventListener("webglcontextlost", onLost);
    element.dataset.ready = "";

    return () => {
      unsubscribe();
      loop.stop();
      layer.destroy();
      element.removeEventListener("webglcontextlost", onLost);
      delete element.dataset.ready;
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 size-full opacity-0 transition-opacity duration-1000 data-ready:opacity-100"
    />
  );
}

function currentPalette({ from, to, start }: { from: Palette; to: Palette; start: number }, now: number): Palette {
  const t = easeInOutCubic(Math.min(1, (now - start) / (duration.theme * 1000)));
  return {
    accent: mixRgb(from.accent, to.accent, t),
    alt: mixRgb(from.alt, to.alt, t),
    glow: mixRgb(from.glow, to.glow, t),
    cold: from.cold + (to.cold - from.cold) * t,
  };
}
