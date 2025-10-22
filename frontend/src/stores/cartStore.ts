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
  updateItem: (id: string, item: CartItem) => void;
  getItem: (id: string) => CartItem | undefined;
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

  updateItem: (id, updatedItem) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? updatedItem : item
      ),
    }));
  },

  getItem: (id) => {
    const items = get().items;
    return items.find((item) => item.id === id);
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalPrice: () => {
    const items = get().items;
    return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  },
}));
