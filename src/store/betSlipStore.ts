import { create } from 'zustand';

export interface BetSlipSelection {
  selectionId: string;
  eventId: string;
  eventName: string;
  marketName: string;
  selectionName: string;
  odds: number;
}

interface BetSlipState {
  selections: BetSlipSelection[];
  addSelection: (s: BetSlipSelection) => void;
  removeSelection: (selectionId: string) => void;
  clearSlip: () => void;
  hasSelection: (selectionId: string) => boolean;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  selections: [],
  addSelection: (s) =>
    set((state) => {
      if (state.selections.some((x) => x.selectionId === s.selectionId))
        return state;
      return { selections: [...state.selections, s] };
    }),
  removeSelection: (selectionId) =>
    set((state) => ({
      selections: state.selections.filter((s) => s.selectionId !== selectionId),
    })),
  clearSlip: () => set({ selections: [] }),
  hasSelection: (selectionId) =>
    get().selections.some((s) => s.selectionId === selectionId),
}));
