import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { lightning, marbleVeins, silk, smoke } from "@/lib/texture";
import type { TextureKind } from "@/types/product";

type TextureProps = { kind: TextureKind; seed: string; className?: string };

/**
 * A product world's procedural texture, coloured by the theme variables in scope. Any product
 * picks one in `theme.texture` and gets its own variation, seeded by its slug.
 */
export function Texture({ kind, seed, className }: TextureProps) {
  const id = useId();
  if (kind === "none") return null;

  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      data-texture={kind}
      className={cn("texture pointer-events-none absolute inset-0 size-full", className)}
    >
      {kind === "marble-veins" && <Marble seed={seed} />}
      {kind === "lightning" && <Lightning seed={seed} />}
      {kind === "smoke" && <Smoke seed={seed} gradient={`${id}-smoke`} />}
      {kind === "silk" && <Silk seed={seed} gradient={`${id}-silk`} />}
    </svg>
  );
}

function Marble({ seed }: { seed: string }) {
  const { veins, branches } = marbleVeins(seed);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="texture-glow" strokeWidth="10">
        {veins.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
      <g className="texture-line" strokeWidth="1.6">
        {veins.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
      <g className="texture-line texture-faint" strokeWidth="0.9">
        {branches.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
    </g>
  );
}

function Lightning({ seed }: { seed: string }) {
  const { bolts } = lightning(seed);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {bolts.map((bolt, index) => (
        <g key={index} className="texture-bolt" style={{ animationDelay: `${index * -2.3}s` }}>
          <path d={bolt.core} className="texture-glow" strokeWidth="14" />
          <path d={bolt.core} className="texture-glow" strokeWidth="5" />
          <path d={bolt.core} className="texture-core" strokeWidth="1.4" />
          {bolt.branches.map((d, branch) => (
            <path key={branch} d={d} className="texture-line" strokeWidth="1" />
          ))}
        </g>
      ))}
    </g>
  );
}

function Smoke({ seed, gradient }: { seed: string; gradient: string }) {
  const blobs = smoke(seed);
  return (
    <>
      <defs>
        <radialGradient id={gradient}>
          <stop offset="0" className="texture-stop-accent" />
          <stop offset="1" className="texture-stop-accent" stopOpacity="0" />
        </radialGradient>
      </defs>
      {blobs.map((blob, index) => (
        <circle
          key={index}
          cx={blob.x}
          cy={blob.y}
          r={blob.r}
          fill={`url(#${gradient})`}
          opacity={blob.opacity}
          className="texture-drift"
          style={{ animationDuration: `${blob.duration}s`, animationDelay: `${blob.delay}s` } as CSSProperties}
        />
      ))}
    </>
  );
}

function Silk({ seed, gradient }: { seed: string; gradient: string }) {
  const ribbons = silk(seed);
  return (
    <>
      <defs>
        <linearGradient id={gradient} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" className="texture-stop-alt" stopOpacity="0" />
          <stop offset="0.5" className="texture-stop-accent" />
          <stop offset="1" className="texture-stop-alt" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" className="texture-sway">
        {ribbons.map((ribbon, index) => (
          <path key={index} d={ribbon.d} stroke={`url(#${gradient})`} strokeWidth={ribbon.width} opacity={ribbon.opacity} />
        ))}
        {ribbons.map((ribbon, index) => (
          <path key={`edge-${index}`} d={ribbon.d} className="texture-line texture-faint" strokeWidth="0.8" />
        ))}
      </g>
    </>
  );
}
