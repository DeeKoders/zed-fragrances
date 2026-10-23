import { create } from "zustand";

type AtmosphereState = {
  /** Ids of opaque sections currently filling the screen; the WebGL atmosphere pauses behind them. */
  covers: Record<string, true>;
  setCover: (id: string, covering: boolean) => void;
};

export const useAtmosphere = create<AtmosphereState>()((set) => ({
  covers: {},
  setCover: (id, covering) =>
    set((state) => {
      if (covering === (id in state.covers)) return state;
      const covers = { ...state.covers };
      if (covering) covers[id] = true;
      else delete covers[id];
      return { covers };
    }),
}));
