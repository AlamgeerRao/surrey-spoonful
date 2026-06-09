type CartItem = {
  id: string;
  name: string;
  size: string;
  pricePence: number;
  quantity: number;
};

const STORAGE_KEY = "hpk-cart";
const CART_DATE_KEY = "hpk_cart_date";
const DELIVERY_DATE_STORAGE_KEY = "hpk_selected_delivery_date";

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

function getStoredCartDate(): string | null {
  try {
    return localStorage.getItem(CART_DATE_KEY);
  } catch {
    return null;
  }
}

function setStoredCartDate(dateKey: string) {
  try {
    localStorage.setItem(CART_DATE_KEY, dateKey);
  } catch {
    // ignore errors
  }
}

function clearStoredCartDate() {
  try {
    localStorage.removeItem(CART_DATE_KEY);
  } catch {
    // ignore errors
  }
}

function getStoredSelectedDeliveryDate(): string | null {
  try {
    return localStorage.getItem(DELIVERY_DATE_STORAGE_KEY);
  } catch {
    return null;
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

// ✅ Selected delivery date helpers
export function getSelectedDeliveryDateKey() {
  return getStoredSelectedDeliveryDate();
}

export function setSelectedDeliveryDate(dateKey: string) {
  try {
    localStorage.setItem(DELIVERY_DATE_STORAGE_KEY, dateKey);
  } catch {
    // ignore errors
  }
  notify();
}

// ✅ Basket delivery date helpers
export function getCartDateKey() {
  return getStoredCartDate();
}

export function getCartDateLabel() {
  const dateKey = getStoredCartDate() || getStoredSelectedDeliveryDate();

  if (!dateKey) return "";

  const parsed = new Date(dateKey);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ✅ Core enforcement: one basket = one delivery date
export function addToCart(item: CartItem) {
  const selectedDate = getStoredSelectedDeliveryDate();
  const cartDate = getStoredCartDate();

  // No selected date → block add
  if (!selectedDate) {
    window.alert("Please select a delivery date first.");
    return;
  }

  // Cart already belongs to another day
  if (cartDate && cartDate !== selectedDate) {
    const confirmClear = window.confirm(
      "Your basket contains dishes for another delivery date. Changing date will clear your basket. Continue?"
    );

    if (!confirmClear) {
      return;
    }

    // clear current cart first
    cart = [];
    saveCart(cart);
    setStoredCartDate(selectedDate);
  }

  // first add to empty or unbound cart → bind basket date
  if (!cartDate) {
    setStoredCartDate(selectedDate);
  }

  const incrementBy = Number(item.quantity || 1);

  const existing = cart.find(
    (c) => c.id === item.id && c.size === item.size
  );

  if (existing) {
    existing.quantity += incrementBy;
  } else {
    cart.push({ ...item, quantity: incrementBy });
  }

  notify();
}

// ✅ Replace entire cart (for qty/remove logic)
export function setCart(newCart: CartItem[]) {
  cart = newCart;

  if (newCart.length === 0) {
    clearStoredCartDate();
  } else if (!getStoredCartDate()) {
    const selectedDate = getStoredSelectedDeliveryDate();
    if (selectedDate) {
      setStoredCartDate(selectedDate);
    }
  }

  notify();
}

// ✅ Explicit clear helper
export function clearCart() {
  cart = [];
  saveCart(cart);
  clearStoredCartDate();
  notify();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}
