type CartItem = {
  id: string;
  name: string;
  size: string;
  pricePence: number;
  quantity: number;
};

let cart: CartItem[] = [];

// simple subscribers (like global state)
const listeners: (() => void)[] = [];

function notify() {
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

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}
