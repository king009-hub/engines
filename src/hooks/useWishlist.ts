import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'engine-wishlist';

function getStored(): string[] {
  try {
    const s = localStorage.getItem(WISHLIST_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function useWishlist() {
  const [items, setItems] = useState<string[]>(getStored);

  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    const itemsStr = JSON.stringify(items);
    if (stored !== itemsStr) {
      localStorage.setItem(WISHLIST_KEY, itemsStr);
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  }, [items]);

  useEffect(() => {
    const handler = () => {
      const stored = getStored();
      setItems(prev => {
        if (JSON.stringify(prev) === JSON.stringify(stored)) return prev;
        return stored;
      });
    };
    window.addEventListener('wishlist-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('wishlist-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const toggle = useCallback((productId: string) => {
    setItems(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId: string) => items.includes(productId), [items]);

  return { wishlistIds: items, toggle, isWishlisted, count: items.length };
}
