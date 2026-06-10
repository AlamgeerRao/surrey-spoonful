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
const DELIVERY_SLOT_STORAGE_KEY = "hpk_selected_delivery_slot"; // ✅ NEW

// ✅ Load cart
function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// ✅ Save cart
function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {}
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
  } catch {}
}

function clearStoredCartDate() {
  try {
    localStorage.removeItem(CART_DATE_KEY);
  } catch {}
}

function getStoredSelectedDeliveryDate(): string | null {
  try {
    return localStorage.getItem(DELIVERY_DATE_STORAGE_KEY);
  } catch {
    return null;
  }
}

// ✅ NEW SLOT HELPERS
function getStoredSelectedDeliverySlot(): string | null {
  try {
    return localStorage.getItem(DELIVERY_SLOT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredSelectedDeliverySlot(slot: string) {
  try {
    localStorage.setItem(DELIVERY_SLOT_STORAGE_KEY, slot);
  } catch {}
}

function clearStoredSelectedDeliverySlot() {
  try {
    localStorage.removeItem(DELIVERY_SLOT_STORAGE_KEY);
  } catch {}
}

// ✅ initialise from storage
let cart: CartItem[] = loadCart();

const listeners: (() => void)[] = [];

function notify() {
  saveCart(cart);
  listeners.forEach((l) => l());
}

export function getCart() {
  return cart;
}

// ✅ DELIVERY DATE
export function getSelectedDeliveryDateKey() {
  return getStoredSelectedDeliveryDate();
}

export function setSelectedDeliveryDate(dateKey: string) {
  try {
    localStorage.setItem(DELIVERY_DATE_STORAGE_KEY, dateKey);
  } catch {}
  notify();
}

// ✅ ✅ NEW: DELIVERY SLOT API (public)
export function getSelectedDeliverySlot() {
  return getStoredSelectedDeliverySlot();
}

export function setSelectedDeliverySlot(slot: "breakfast" | "lunch" | "dinner") {
  setStoredSelectedDeliverySlot(slot);
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

// ✅ CORE: One basket = one date
export function addToCart(item: CartItem) {
  const selectedDate = getStoredSelectedDeliveryDate();
  const selectedSlot = getStoredSelectedDeliverySlot(); // ✅ NEW

  const cartDate = getStoredCartDate();

  // ❌ Block if no date
  if (!selectedDate) {
    window.alert("Please select a delivery date first.");
    return;
  }

  // ❌ Block if no slot (future-ready safe guard)
  if (!selectedSlot) {
    window.alert("Please select a delivery slot first.");
    return;
  }

  if (cartDate && cartDate !== selectedDate) {
    const confirmClear = window.confirm(
      "Your basket contains dishes for another delivery date. Changing date will clear your basket. Continue?"
    );

    if (!confirmClear) return;

    cart = [];
    saveCart(cart);
    setStoredCartDate(selectedDate);
  }

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

// ✅ Replace cart
export function setCart(newCart: CartItem[]) {
  cart = newCart;

  if (newCart.length === 0) {
    clearStoredCartDate();
  } else if (!getStoredCartDate()) {
    const selectedDate = getStoredSelectedDeliveryDate();
    if (selectedDate) setStoredCartDate(selectedDate);
  }

  notify();
}

// ✅ Clear cart
export function clearCart() {
  cart = [];
  saveCart(cart);
  clearStoredCartDate();
  clearStoredSelectedDeliverySlot(); // ✅ also clear slot
  notify();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}
