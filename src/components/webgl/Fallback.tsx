/** Static, theme-tinted glow behind the page. The WebGL layer (Phase 2c) renders over it; without WebGL it stands alone. */
export function AtmosphereFallback() {
  return <div aria-hidden className="ambient-glow pointer-events-none fixed inset-0 -z-10" />;
}
