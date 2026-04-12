import { useState, useEffect, useCallback, useRef } from 'react';
import type { LocalCartItem } from '@/lib/types';

const CART_KEY = 'engine-cart';

function getStoredCart(): LocalCartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function useCart() {
  const [items, setItems] = useState<LocalCartItem[]>(getStoredCart);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (!isInternalUpdate.current) {
        const stored = getStoredCart();
        setItems(prev => {
          if (JSON.stringify(prev) === JSON.stringify(stored)) return prev;
          return stored;
        });
      }
    };
    window.addEventListener('cart-updated', handler);
    window.addEventListener('storage', handler); // Also sync across tabs
    return () => {
      window.removeEventListener('cart-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const addItem = useCallback((productId: string, qty = 1) => {
    isInternalUpdate.current = true;
    const stored = getStoredCart();
    const existing = stored.find(i => i.product_id === productId);
    let next;
    if (existing) {
      next = stored.map(i => i.product_id === productId ? { ...i, quantity: i.quantity + qty } : i);
    } else {
      next = [...stored, { product_id: productId, quantity: qty }];
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event('cart-updated'));
    isInternalUpdate.current = false;
  }, []);

  const removeItem = useCallback((productId: string) => {
    isInternalUpdate.current = true;
    const stored = getStoredCart();
    const next = stored.filter(i => i.product_id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event('cart-updated'));
    isInternalUpdate.current = false;
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    isInternalUpdate.current = true;
    const stored = getStoredCart();
    let next;
    if (quantity <= 0) {
      next = stored.filter(i => i.product_id !== productId);
    } else {
      next = stored.map(i => i.product_id === productId ? { ...i, quantity } : i);
    }
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event('cart-updated'));
    isInternalUpdate.current = false;
  }, []);

  const clearCart = useCallback(() => {
    isInternalUpdate.current = true;
    localStorage.removeItem(CART_KEY);
    setItems([]);
    window.dispatchEvent(new Event('cart-updated'));
    isInternalUpdate.current = false;
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems };
}
