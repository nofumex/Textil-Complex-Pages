import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId: string) => {
        const exists = get().ids.includes(productId);
        set({ ids: exists ? get().ids.filter(id => id !== productId) : [...get().ids, productId] });
      },
      add: (productId: string) => {
        if (!get().ids.includes(productId)) {
          set({ ids: [...get().ids, productId] });
        }
      },
      remove: (productId: string) => {
        set({ ids: get().ids.filter(id => id !== productId) });
      },
      has: (productId: string) => get().ids.includes(productId),
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ ids: state.ids }),
    }
  )
);








