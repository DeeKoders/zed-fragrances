"use client";

import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { createLoop, createShaderLayer, GLSL_NOISE, hexToRgb } from "@/lib/webgl";
import { useTheme } from "@/providers/ThemeProvider";

/** What the seam shader reads every frame. Written by the split hero. */
export type SeamState = { balance: number; seam: number; axis: "x" | "y" };

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform float uSeam;
uniform float uAxis;
uniform float uBalance;
uniform float uPx;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uGold;
${GLSL_NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  // CSS coordinates: x left to right, y top to bottom.
  vec2 css = vec2(uv.x, 1.0 - uv.y);
  float across = mix(css.x, css.y, uAxis) - uSeam;
  float along = mix(css.y, css.x, uAxis);
  float extent = mix(uRes.x, uRes.y, uAxis) / uPx;
  float t = uTime * 0.35;

  // A living boundary: the seam wanders with layered noise.
  float wander = (fbm(vec2(along * 3.0, t)) - 0.5) * 0.05 + (fbm(vec2(along * 11.0 - t * 2.0, t * 1.3)) - 0.5) * 0.015;
  float d = (across - wander) * extent;
  float side = step(0.0, d);
  vec3 sideColor = mix(uColorA, uColorB, side);
  float energy = 0.75 + abs(uBalance) * 0.6;

  float core = exp(-abs(d) / 1.4) * (0.75 + 0.25 * sin(uTime * 7.0 + along * 30.0));
  float glow = exp(-abs(d) / 22.0);
  float haze = exp(-abs(d) / 90.0);

  // Smoke tendrils curling off both sides.
  float smoke = fbm(vec2(across * 14.0 + t * 0.8, along * 5.0 - t)) * fbm(vec2(along * 9.0 + t, across * 30.0));
  smoke = smoothstep(0.12, 0.45, smoke) * haze;

  // Sparks riding the seam.
  vec2 grid = vec2(along * 60.0 - t * 8.0, d / 10.0);
  vec2 id = floor(grid);
  float spark = step(0.93, hash(id)) * (1.0 - smoothstep(0.0, 0.45, length(fract(grid) - 0.5))) * exp(-abs(d) / 30.0);
  spark *= 0.5 + 0.5 * sin(uTime * 9.0 + hash(id) * 50.0);

  vec3 color = uGold * core * 1.2 + sideColor * glow * 0.55 * energy + mix(sideColor, uGold, 0.3) * smoke * 0.6 + uGold * spark;
  float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

type SeamCanvasProps = { slugs: [string, string]; state: SeamState };

/**
 * The split hero's seam as a shader: a wandering gold core, each world's glow on its own side,
 * curling smoke and sparks, brighter as one world wins. Pauses off-screen and in hidden tabs.
 */
export default function SeamCanvas({ slugs, state }: SeamCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { themes } = useTheme();
  const colors = slugs.map((slug) => themes.find((theme) => theme.id === slug)?.glow ?? brand.palette.gold["400"]);
  const [colorA, colorB] = colors;

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const layer = createShaderLayer(element, FRAGMENT, { maxDpr: 1.5 });
    if (!layer) return;
    const { gl, uniform } = layer;
    gl.uniform3fv(uniform("uColorA"), hexToRgb(colorA));
    gl.uniform3fv(uniform("uColorB"), hexToRgb(colorB));
    gl.uniform3fv(uniform("uGold"), hexToRgb(brand.palette.gold["300"]));

    let visible = true;
    const loop = createLoop(
      (time) => {
        const ratio = layer.resize();
        gl.uniform2f(uniform("uRes"), element.width, element.height);
        gl.uniform1f(uniform("uPx"), ratio);
        gl.uniform1f(uniform("uTime"), time);
        gl.uniform1f(uniform("uSeam"), state.seam / 100);
        gl.uniform1f(uniform("uAxis"), state.axis === "y" ? 1 : 0);
        gl.uniform1f(uniform("uBalance"), state.balance);
        layer.draw();
      },
      () => visible,
    );
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      loop.wake();
    });
    observer.observe(element);
    element.dataset.ready = "";

    return () => {
      observer.disconnect();
      loop.stop();
      layer.destroy();
    };
  }, [colorA, colorB, state]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      data-seam-canvas
      className="pointer-events-none absolute inset-0 z-[1] size-full opacity-0 transition-opacity duration-1000 data-ready:opacity-100"
    />
  );
}
