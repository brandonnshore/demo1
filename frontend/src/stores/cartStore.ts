import { create } from 'zustand';

interface CartItem {
  id: string;
  variantId: string;
  productTitle: string;
  variantColor: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  customization: any; // CustomizationSpec
  mockupUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalPrice: () => {
    const items = get().items;
    return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  },
}));
