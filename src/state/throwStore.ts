import { create } from "zustand";

/**
 * Transient per-throw UI state (charge power, aiming). Lives outside the game
 * store because it updates every animation frame; the game store holds only
 * durable phase/round state. ponytail: per-frame set() of one number drives a
 * tiny meter — cheap; revisit only if profiling says so.
 */
interface ThrowUIState {
  charging: boolean;
  /** 0..1 charge power. */
  power: number;
  /** Name of the restaurant the predicted landing is currently over, else null. */
  aimLabel: string | null;
  setCharging: (charging: boolean) => void;
  setPower: (power: number) => void;
  setAimLabel: (aimLabel: string | null) => void;
  reset: () => void;
}

export const useThrowUI = create<ThrowUIState>((set) => ({
  charging: false,
  power: 0,
  aimLabel: null,
  setCharging: (charging) => set({ charging }),
  setPower: (power) => set({ power }),
  setAimLabel: (aimLabel) => set({ aimLabel }),
  reset: () => set({ charging: false, power: 0, aimLabel: null }),
}));
