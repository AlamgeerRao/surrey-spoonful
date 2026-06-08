// Menu data for Homemade Pakistani Kitchen.
// Each "dish" exposes one or more sizes; sizes are flattened into MENU as
// individual MenuItem records (id = `${dishId}-${sizeId}`) so the basket can
// reference a specific size as a unique line.

export type SpiceLevel = 0 | 1 | 2 | 3;
export type Category =
  | "curries"
  | "rice"
  | "vegetarian"
  | "sides";

export interface Size {
  id: string;
  label: string;
  pricePence: number;
}

export interface Dish {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  longDescription: string;
  spice: SpiceLevel;
  allergens: string[];
  halal: boolean;
  popular?: boolean;
  weeklySpecial?: boolean;
  image: string;
  available: boolean;
  sizes: Size[];
}

export interface MenuItem extends Omit<Dish, "sizes"> {
  sizeId: string;
  sizeLabel: string;
  pricePence: number;
  portion: string;
  dishId: string;
  dishSlug: string;
}

export const CATEGORIES = [
  { id: "curries", label: "Curries", blurb: "Slow-cooked, hand-ground masalas" },
  { id: "rice", label: "Rice & Biryani", blurb: "Aromatic basmati, dum-style" },
  { id: "vegetarian", label: "Vegetarian", blurb: "Garden-fresh sabzi & daal" },
  { id: "sides", label: "Sides", blurb: "Fresh bread & crispy snacks" },
];

// ✅ Your existing DISHES unchanged (shortened here for readability)
export const DISHES: Dish[] = [
  // ✅ KEEP YOUR FULL EXISTING DISHES ARRAY HERE EXACTLY AS YOU HAVE IT
];

// ✅ Flatten dishes -> menu variants (fallback)
export const MENU: MenuItem[] = DISHES.flatMap((d) =>
  d.sizes.map((s) => ({
    id: `${d.id}-${s.id}`,
    dishId: d.id,
    dishSlug: d.slug,
    slug: d.slug,
    name: d.name,
    category: d.category,
    description: d.description,
    longDescription: d.longDescription,
    spice: d.spice,
    allergens: d.allergens,
    halal: d.halal,
    popular: d.popular,
    weeklySpecial: d.weeklySpecial,
    image: d.image,
    available: d.available,
    sizeId: s.id,
    sizeLabel: s.label,
    pricePence: s.pricePence,
    portion: s.label,
  }))
);

/* =========================================================
   ✅ NEW — API INTEGRATION (SAFE)
========================================================= */

const API_URL =
  "https://YOUR-FUNCTION-APP.azurewebsites.net/api/menu";

// ✅ Fetch from API with fallback
export async function getMenu(): Promise<MenuItem[]> {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();

    const apiMenu: MenuItem[] = data.flatMap((d: any) =>
      d.sizes.map((s: any) => ({
        id: `${d.id}-${s.id}`,
        dishId: d.id,
        dishSlug: d.slug,
        slug: d.slug,
        name: d.name,
        category: d.category,
        description: d.description,
        longDescription: d.longDescription,
        spice: d.spice,
        allergens: d.allergens,
        halal: d.halal,
        popular: d.popular,
        weeklySpecial: d.weeklySpecial,
        image: d.image,
        available: d.available,
        sizeId: s.id,
        sizeLabel: s.label,
        pricePence: s.pricePence,
        portion: s.label,
      }))
    );

    return apiMenu;
  } catch (err) {
    console.error("API failed, using fallback", err);

    // ✅ fallback to static menu
    return MENU;
  }
}

/* =========================================================
   EXISTING HELPERS (UNCHANGED)
========================================================= */

export function getDish(slug: string): Dish | undefined {
  return DISHES.find((d) => d.slug === slug);
}

export function getMenuItem(slug: string): MenuItem | undefined {
  const dish = getDish(slug);
  if (!dish) return undefined;
  return MENU.find((m) => m.dishId === dish.id);
}

export function getVariant(id: string): MenuItem | undefined {
  return MENU.find((m) => m.id === id);
}

export function getPopularDishes(): Dish[] {
  return DISHES.filter((d) => d.popular);
}

export function getWeeklySpecials(): Dish[] {
  return DISHES.filter((d) => d.weeklySpecial);
}

export function getPopular(): MenuItem[] {
  return getPopularDishes()
    .map((d) => MENU.find((m) => m.dishId === d.id))
    .filter((x): x is MenuItem => Boolean(x));
}

export function getByCategory(cat: Category): Dish[] {
  return DISHES.filter((d) => d.category === cat);
}

export function priceFromPence(dish: Dish): number {
  return Math.min(...dish.sizes.map((s) => s.pricePence));
}
