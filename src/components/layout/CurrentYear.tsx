"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Read on the client only, so the prerendered shell doesn't depend on the build date. */
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span>{year}</span>;
}
