type CartItem = {
  id: string;
  name: string;
  size: string;
  pricePence: number;
  quantity: number;
};

const STORAGE_KEY = "hpk-cart";

// ✅ Load cart from browser storage
function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// ✅ Save cart to browser storage
function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore errors
  }
}

// ✅ initialise from storage
let cart: CartItem[] = loadCart();

// subscribers (simple global state)
const listeners: (() => void)[] = [];

function notify() {
  saveCart(cart); // ✅ persist on every update
  listeners.forEach((l) => l());
}

export function getCart() {
  return cart;
}

export function addToCart(item: CartItem) {
  const existing = cart.find(
    (c) => c.id === item.id && c.size === item.size
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  notify();
}

// ✅ Replace entire cart (for qty/remove logic)
export function setCart(newCart: CartItem[]) {
  cart = newCart;
  notify();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}
