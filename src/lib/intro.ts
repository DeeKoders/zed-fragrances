// The once-per-session intro (preloader). Server-safe: the root layout inlines `introScript`.

/** sessionStorage key, set when the intro plays. Per tab: a new tab plays it again. */
export const INTRO_STORAGE_KEY = "zed:intro";

/** Releases the page if React never takes over. The intro itself lasts duration.preloader. */
const FAILSAFE_MS = 3000;

/**
 * Runs in <head> before first paint and decides whether the intro plays. It marks <html> with
 * data-intro="play" so the server-rendered preloader shows; otherwise the preloader stays hidden.
 * Either way nothing flashes. Skipped for reduced motion, background tabs and blocked storage.
 */
export const introScript = `(function(){try{var d=document.documentElement,k=${JSON.stringify(INTRO_STORAGE_KEY)};if(document.hidden||sessionStorage.getItem(k)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;sessionStorage.setItem(k,"1");d.dataset.intro="play";setTimeout(function(){if(d.dataset.intro==="play")d.dataset.intro="done"},${FAILSAFE_MS})}catch(e){}})();`;
