// ✅ TYPES

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

// ✅ FLATTENED (USED BY UI COMPONENTS)
export interface MenuItem extends Omit<Dish, "sizes"> {
  sizeId: string;
  sizeLabel: string;
  pricePence: number;
  portion: string;
  dishId: string;
  dishSlug: string;
}

// ✅ CATEGORIES

export const CATEGORIES = [
  { id: "curries", label: "Curries", blurb: "Slow-cooked masalas" },
  { id: "rice", label: "Rice & Biryani", blurb: "Aromatic basmati" },
  { id: "vegetarian", label: "Vegetarian", blurb: "Fresh daal & sabzi" },
  { id: "sides", label: "Sides", blurb: "Bread & snacks" }
];

// ✅ FALLBACK DATA (KEEP YOUR FULL VERSION HERE)

export const DISHES: Dish[] = [
  {
    id: "chicken-karahi",
    slug: "chicken-karahi",
    name: "Chicken Karahi",
    category: "curries",
    description: "Tomato, ginger, green chilli — wok-fired.",
    longDescription: "Signature karahi made fresh.",
    spice: 2,
    allergens: ["Dairy"],
    halal: true,
    popular: true,
    weeklySpecial: false,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
    available: true,
    sizes: [
      { id: "quarter", label: "Quarter (250g)", pricePence: 660 },
      { id: "half", label: "Half (500g)", pricePence: 1210 },
      { id: "full", label: "Full (1kg)", pricePence: 2200 }
    ]
  }
  // ✅ IMPORTANT: keep adding your full DISHES list here
];

// ✅ FLATTENED MENU (fallback only)
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
    portion: s.label
  }))
);


// =========================================================
// ✅ API INTEGRATION (FINAL FIX)
// =========================================================

const API_URL = "https://javfoodapp001.azurewebsites.net/api/menu";

// ✅ Now returns Dish[] (NOT flattened)
export async function getMenu(): Promise<Dish[]> {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) throw new Error("API failed");

    const data = await res.json();

    return data;
  } catch (err) {
    console.error("API failed, using fallback", err);

    return DISHES;
  }
}


// =========================================================
// ✅ HELPERS (SAFE + CLEAN)
// =========================================================

export function getDish(slug: string): Dish | undefined {
  return DISHES.find((d) => d.slug === slug);
}

// ✅ Updated to avoid syntax errors and return default size
export function getMenuItem(slug: string): MenuItem | undefined {
  const dish = getDish(slug);
  if (!dish) return undefined;

  const firstSize = dish.sizes[0];

  return {
    ...dish,
    id: `${dish.id}-${firstSize.id}`,
    dishId: dish.id,
    dishSlug: dish.slug,
    sizeId: firstSize.id,
    sizeLabel: firstSize.label,
    pricePence: firstSize.pricePence,
    portion: firstSize.label
  };
}

export function getPopularDishes(): Dish[] {
  return DISHES.filter((d) => d.popular);
}

export function getWeeklySpecials(): Dish[] {
  return DISHES.filter((d) => d.weeklySpecial);
}

export function getByCategory(cat: Category): Dish[] {
  return DISHES.filter((d) => d.category === cat);
}
export function priceFromPence(dish: Dish): number {
  return Math.min(...dish.sizes.map((s) => s.pricePence));
}
