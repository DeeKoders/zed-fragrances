// Minimal raw-WebGL helpers for full-screen fragment-shader layers. No three.js: each layer is a
// single triangle covering the canvas, so the bundle stays tiny.

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function mixRgb(from: Rgb, to: Rgb, t: number): Rgb {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
}

/** Same curve as the silk ease (theme morphs), close enough for colour interpolation. */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

let support: boolean | undefined;

export function supportsWebGL() {
  if (support === undefined) {
    try {
      support = Boolean(document.createElement("canvas").getContext("webgl"));
    } catch {
      support = false;
    }
  }
  return support;
}

/** Shared GLSL: value noise and fbm. */
export const GLSL_NOISE = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}
`;

const VERTEX = "attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }";

export type ShaderLayer = {
  gl: WebGLRenderingContext;
  uniform: (name: string) => WebGLUniformLocation | null;
  /** Matches the backing store to the canvas' CSS size. Returns device pixels per CSS pixel. */
  resize: () => number;
  draw: () => void;
  destroy: () => void;
};

type LayerOptions = {
  /** Device pixel ratio cap. */
  maxDpr?: number;
  /** Render scale below that (soft effects can render at a fraction and upscale). */
  scale?: number;
};

export function createShaderLayer(
  canvas: HTMLCanvasElement,
  fragment: string,
  { maxDpr = 1.5, scale = 1 }: LayerOptions = {},
): ShaderLayer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn("[webgl]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const frag = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vertex || !frag || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[webgl]", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const locations = new Map<string, WebGLUniformLocation | null>();

  return {
    gl,
    uniform: (name) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      return locations.get(name) ?? null;
    },
    resize: () => {
      const ratio = Math.min(window.devicePixelRatio || 1, maxDpr) * scale;
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      return ratio;
    },
    draw: () => gl.drawArrays(gl.TRIANGLES, 0, 3),
    destroy: () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(frag);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/**
 * Runs `frame` on requestAnimationFrame while `isRunning()` holds, and stops while the tab is
 * hidden. Call `wake()` when a condition behind isRunning may have changed.
 */
export function createLoop(frame: (time: number) => void, isRunning: () => boolean) {
  let handle = 0;
  const step = (time: number) => {
    handle = 0;
    if (!isRunning() || document.hidden) return;
    frame(time / 1000);
    handle = requestAnimationFrame(step);
  };
  const wake = () => {
    if (!handle && isRunning() && !document.hidden) handle = requestAnimationFrame(step);
  };
  document.addEventListener("visibilitychange", wake);
  wake();
  return {
    wake,
    stop: () => {
      cancelAnimationFrame(handle);
      handle = 0;
      document.removeEventListener("visibilitychange", wake);
    },
  };
}
