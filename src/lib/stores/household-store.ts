import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HouseholdState {
  activeHouseholdId: string | null;
  setActiveHousehold: (id: string) => void;
  clearActiveHousehold: () => void;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set) => ({
      activeHouseholdId: null,
      setActiveHousehold: (id) => set({ activeHouseholdId: id }),
      clearActiveHousehold: () => set({ activeHouseholdId: null }),
    }),
    {
      name: 'manyhandz-household',
    }
  )
);
