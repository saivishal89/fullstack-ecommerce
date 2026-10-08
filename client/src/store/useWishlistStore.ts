import { create } from 'zustand';
import { wishlistApi } from '../api/services';
import { useToastStore } from './useToastStore';

interface WishlistState {
  items: any[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleItem: (productId: string) => Promise<boolean>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    try {
      set({ isLoading: true });
      const items = await wishlistApi.getWishlist();
      set({ items, isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  toggleItem: async (productId) => {
    try {
      const res = await wishlistApi.toggleItem(productId);
      await get().fetchWishlist();
      useToastStore.getState().addToast({
        type: res.inWishlist ? 'success' : 'info',
        title: res.inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
        message: res.inWishlist
          ? 'Saved to your personal wishlist'
          : 'Removed from your personal wishlist',
      });
      return res.inWishlist;
    } catch (err: any) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Wishlist Error',
        message: err.message || 'Please log in to manage your wishlist',
      });
      return false;
    }
  },

  removeItem: async (productId) => {
    try {
      await wishlistApi.removeItem(productId);
      set({ items: get().items.filter((i) => i.productId !== productId) });
    } catch (err: any) {
      console.error(err);
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i.productId === productId);
  },
}));
