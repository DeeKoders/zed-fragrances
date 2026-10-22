/** Cinematic vignette and film grain over the whole site. */
export function GrainOverlay() {
  return (
    <>
      <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-40" />
      <div aria-hidden className="grain pointer-events-none fixed z-[60]" />
    </>
  );
}
