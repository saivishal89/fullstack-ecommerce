import { create } from 'zustand';
import { Cart } from '@ecommerce/shared';
import { cartApi } from '../api/services';
import { useToastStore } from './useToastStore';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, variantId?: string | null) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const cart = await cartApi.getCart();
      set({ cart, isLoading: false });
    } catch {
      set({ cart: null, isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1, variantId = null) => {
    try {
      set({ isLoading: true });
      const cart = await cartApi.addItem(productId, quantity, variantId);
      set({ cart, isLoading: false, isOpen: true });
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Added to cart',
        message: 'Product was successfully added to your shopping bag',
      });
    } catch (err: any) {
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Cart error',
        message: err.message || 'Could not add item to cart',
      });
      throw err;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const cart = await cartApi.updateQuantity(itemId, quantity);
      set({ cart });
    } catch (err: any) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Cart error',
        message: err.message || 'Failed to update quantity',
      });
    }
  },

  removeItem: async (itemId) => {
    try {
      const cart = await cartApi.removeItem(itemId);
      set({ cart });
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Item removed',
        message: 'Item removed from your shopping bag',
      });
    } catch (err: any) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to remove item',
      });
    }
  },

  clearCart: async () => {
    try {
      const cart = await cartApi.clearCart();
      set({ cart });
    } catch (err: any) {
      console.error(err);
    }
  },
}));
