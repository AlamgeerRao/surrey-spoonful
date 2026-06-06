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
  id: string;       // e.g. "full" | "half" | "quarter" | "80g" | "2"
  label: string;    // e.g. "Full (1kg)"
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

// A variant flattened from a dish + a single size.
export interface MenuItem extends Omit<Dish, "sizes"> {
  sizeId: string;
  sizeLabel: string;
  pricePence: number;
  portion: string;          // mirrors sizeLabel for legacy components
  dishId: string;
  dishSlug: string;
}

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "curries", label: "Curries", blurb: "Slow-cooked, hand-ground masalas" },
  { id: "rice", label: "Rice & Biryani", blurb: "Aromatic basmati, dum-style" },
  { id: "vegetarian", label: "Vegetarian", blurb: "Garden-fresh sabzi & daal" },
  { id: "sides", label: "Sides", blurb: "Fresh bread & crispy snacks" },
];

// Reliable food imagery (Unsplash CDN). Admin can replace later.
const IMG = {
  chickenKarahi: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&q=80&auto=format&fit=crop",
  lambKarahi: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200&q=80&auto=format&fit=crop",
  chickenCurry: "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=1200&q=80&auto=format&fit=crop",
  boiledRice: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&q=80&auto=format&fit=crop",
  chickenBiryani: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80&auto=format&fit=crop",
  lambBiryani: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1200&q=80&auto=format&fit=crop",
  lambPulao: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&q=80&auto=format&fit=crop",
  daalMash: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&q=80&auto=format&fit=crop",
  daalChana: "https://images.unsplash.com/photo-1626100134240-1d2380b32833?w=1200&q=80&auto=format&fit=crop",
  daalMix: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80&auto=format&fit=crop",
  roti: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=80&auto=format&fit=crop",
  samosa: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=80&auto=format&fit=crop",
};

const curryGramSizes = (basePence: number): Size[] => [
  { id: "quarter", label: "Quarter (250g)", pricePence: Math.round(basePence * 0.3) },
  { id: "half", label: "Half (500g)", pricePence: Math.round(basePence * 0.55) },
  { id: "full", label: "Full (1kg)", pricePence: basePence },
];

const riceSizes = (basePence: number): Size[] => [
  { id: "80g", label: "Small (80g)", pricePence: Math.round(basePence * 0.4) },
  { id: "160g", label: "Medium (160g)", pricePence: Math.round(basePence * 0.7) },
  { id: "320g", label: "Large (320g)", pricePence: basePence },
];

const daalSizes = (basePence: number): Size[] => [
  { id: "75g", label: "Small (75g)", pricePence: Math.round(basePence * 0.4) },
  { id: "150g", label: "Medium (150g)", pricePence: Math.round(basePence * 0.7) },
  { id: "300g", label: "Large (300g)", pricePence: basePence },
];

export const DISHES: Dish[] = [
  {
    id: "chicken-karahi",
    slug: "chicken-karahi",
    name: "Chicken Karahi",
    category: "curries",
    description: "Tomato, ginger, green chilli — wok-fired with crushed coriander.",
    longDescription:
      "Our signature karahi — bone-in chicken seared in mustard oil with vine-ripened tomatoes, julienne ginger and fresh green chilli, finished with crushed coriander seed.",
    spice: 2, halal: true, popular: true, available: true,
    allergens: ["Dairy"],
    image: IMG.chickenKarahi,
    sizes: curryGramSizes(2200), // £22 full
  },
  {
    id: "lamb-karahi",
    slug: "lamb-karahi",
    name: "Lamb Karahi",
    category: "curries",
    description: "Slow-cooked lamb in a fiery tomato & ginger masala.",
    longDescription:
      "Diced shoulder of lamb cooked low and slow until fork-tender, then tossed with tomato, ginger, chilli and a crackle of black pepper.",
    spice: 2, halal: true, popular: true, available: true,
    allergens: ["Dairy"],
    image: IMG.lambKarahi,
    sizes: curryGramSizes(2800), // £28 full
  },
  {
    id: "chicken-curry",
    slug: "chicken-curry",
    name: "Chicken Curry",
    category: "curries",
    description: "Home-style chicken in a tomato & onion gravy.",
    longDescription:
      "Everyday Pakistani chicken curry — onion-tomato base, whole spice, slow simmered until the masala turns deep amber.",
    spice: 1, halal: true, available: true,
    allergens: [],
    image: IMG.chickenCurry,
    sizes: curryGramSizes(2000), // £20 full
  },
  {
    id: "boiled-rice",
    slug: "boiled-rice",
    name: "Boiled Basmati Rice",
    category: "rice",
    description: "Long-grain basmati, steamed fluffy.",
    longDescription: "Aged long-grain basmati, rinsed, soaked and steamed grain-by-grain.",
    spice: 0, halal: true, available: true,
    allergens: [],
    image: IMG.boiledRice,
    sizes: riceSizes(500), // £5 large
  },
  {
    id: "chicken-biryani",
    slug: "chicken-biryani",
    name: "Chicken Biryani",
    category: "rice",
    description: "Layered basmati with slow-cooked chicken, saffron & dum.",
    longDescription:
      "Sindhi-style dum biryani — marinated chicken thigh, golden potato, fried onion and saffron rice, sealed and steamed.",
    spice: 2, halal: true, popular: true, available: true,
    allergens: ["Dairy", "Nuts"],
    image: IMG.chickenBiryani,
    sizes: riceSizes(950),
  },
  {
    id: "lamb-biryani",
    slug: "lamb-biryani",
    name: "Lamb Biryani",
    category: "rice",
    description: "Spiced lamb yakhni rice, layered with basmati.",
    longDescription:
      "Lamb on the bone, slow-cooked in spiced yoghurt, layered with saffron-rice and steamed on dum.",
    spice: 2, halal: true, available: true,
    allergens: ["Dairy", "Nuts"],
    image: IMG.lambBiryani,
    sizes: riceSizes(1100),
  },
  {
    id: "lamb-pulao",
    slug: "lamb-pulao",
    name: "Lamb Pulao",
    category: "rice",
    description: "Basmati cooked in deep lamb stock with whole spice.",
    longDescription:
      "Rice braised in reduced lamb yakhni with cardamom, cinnamon and bay — fragrant, never spicy.",
    spice: 1, halal: true, available: true,
    allergens: [],
    image: IMG.lambPulao,
    sizes: riceSizes(1000),
  },
  {
    id: "daal-mash",
    slug: "daal-mash",
    name: "Daal Mash",
    category: "vegetarian",
    description: "White urad daal tempered with cumin & garlic.",
    longDescription:
      "Husked white urad cooked grain-distinct, finished with a sizzling tarka of cumin, garlic and dried red chilli.",
    spice: 1, halal: true, available: true,
    allergens: [],
    image: IMG.daalMash,
    sizes: daalSizes(700),
  },
  {
    id: "daal-chana",
    slug: "daal-chana",
    name: "Daal Chana",
    category: "vegetarian",
    description: "Split yellow chickpea daal, deeply spiced.",
    longDescription:
      "Chana daal slow-cooked until just al-dente, layered with onion masala and finished with ginger and green chilli.",
    spice: 1, halal: true, available: true,
    allergens: [],
    image: IMG.daalChana,
    sizes: daalSizes(700),
  },
  {
    id: "daal-mix",
    slug: "daal-mix",
    name: "Daal Mix",
    category: "vegetarian",
    description: "Five-lentil blend, slow simmered, ghee tarka.",
    longDescription:
      "A homely blend of urad, masoor, moong, chana and toor — simmered for hours, finished with a generous ghee tarka.",
    spice: 1, halal: true, popular: true, available: true,
    allergens: ["Dairy"],
    image: IMG.daalMix,
    sizes: daalSizes(750),
  },
  {
    id: "tawa-roti",
    slug: "tawa-roti",
    name: "Tawa Roti",
    category: "sides",
    description: "Soft whole-wheat flatbread, cooked on the tawa.",
    longDescription: "Wholemeal roti rolled and cooked fresh on a cast-iron tawa.",
    spice: 0, halal: true, available: true,
    allergens: ["Gluten"],
    image: IMG.roti,
    sizes: [
      { id: "2", label: "Pack of 2", pricePence: 200 },
      { id: "4", label: "Pack of 4", pricePence: 380 },
      { id: "8", label: "Pack of 8", pricePence: 720 },
    ],
  },
  {
    id: "aloo-samosa",
    slug: "aloo-samosa",
    name: "Aloo Samosa",
    category: "sides",
    description: "Hand-folded pastry, spiced potato, deep-fried.",
    longDescription: "Crispy hand-folded samosas with a cumin-spiced potato & pea filling.",
    spice: 1, halal: true, popular: true, available: true,
    allergens: ["Gluten"],
    image: IMG.samosa,
    sizes: [
      { id: "6", label: "Box of 6", pricePence: 360 },
      { id: "12", label: "Box of 12", pricePence: 660 },
      { id: "18", label: "Box of 18", pricePence: 950 },
    ],
  },
];

// Flatten dishes -> menu variants
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
  })),
);

export function getDish(slug: string): Dish | undefined {
  return DISHES.find((d) => d.slug === slug);
}

export function getMenuItem(slug: string): MenuItem | undefined {
  // Returns the smallest-size variant as a default (used by SEO/detail page).
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

// Legacy helpers kept so existing imports keep compiling.
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
