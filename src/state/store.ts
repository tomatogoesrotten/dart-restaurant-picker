import { create } from "zustand";
import type { LockedSelection, Phase, Restaurant, ThrowResult } from "../types";
import { resultStore } from "../data/resultStore";

/**
 * The only allowed phase transitions. Any edge not listed here is rejected,
 * so `phase` is always a valid state reached by a defined path.
 */
const EDGES: Record<Phase, Phase[]> = {
  "pick-area": ["materialize"],
  materialize: ["aim"],
  aim: ["throw"],
  throw: ["result/retry"],
  "result/retry": ["aim", "pick-area"],
};

export function canTransition(from: Phase, to: Phase): boolean {
  return EDGES[from].includes(to);
}

interface GameStore {
  phase: Phase;
  /** The locked bounds + filters for the current round. */
  selection: LockedSelection | null;
  /** Filtered restaurants → board pins for the current round. */
  restaurants: Restaurant[];
  /** Data-URL snapshot of the locked map view, used as the board texture. */
  boardTexture: string | null;
  /** Result of the most recent throw (null until first resolution). */
  result: ThrowResult | null;

  /** pick-area → materialize: store the round's selection, pins, and texture. */
  lockBounds: (
    selection: LockedSelection,
    restaurants: Restaurant[],
    boardTexture: string,
  ) => void;
  /** materialize → aim: the board has finished building. */
  materialized: () => void;
  /** aim → throw: the dart has been released. */
  releaseThrow: () => void;
  /** throw → result/retry: the dart resolved hit/miss. Records the result. */
  resolveThrow: (result: ThrowResult) => void;
  /** result/retry → aim: same board and pins retained. */
  throwAgain: () => void;
  /** result/retry → pick-area: clear board, pins, and throw state. */
  pickNewArea: () => void;
}

export const useGame = create<GameStore>((set, get) => {
  /** Guarded transition: only mutates phase along a defined edge. */
  const go = (to: Phase, patch: Partial<GameStore> = {}): void => {
    const from = get().phase;
    if (!canTransition(from, to)) {
      console.warn(`Rejected transition ${from} → ${to}`);
      return;
    }
    set({ phase: to, ...patch });
  };

  return {
    phase: "pick-area",
    selection: null,
    restaurants: [],
    boardTexture: null,
    result: null,

    lockBounds: (selection, restaurants, boardTexture) =>
      go("materialize", { selection, restaurants, boardTexture, result: null }),

    materialized: () => go("aim"),

    releaseThrow: () => go("throw"),

    resolveThrow: (result) => {
      resultStore.record(result);
      go("result/retry", { result });
    },

    throwAgain: () => go("aim"),

    pickNewArea: () =>
      go("pick-area", {
        selection: null,
        restaurants: [],
        boardTexture: null,
        result: null,
      }),
  };
});
