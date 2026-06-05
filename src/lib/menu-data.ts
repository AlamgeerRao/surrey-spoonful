import heroFeast from "@/assets/hero-feast.jpg";

export type SpiceLevel = 0 | 1 | 2 | 3;
export type Category =
  | "curries"
  | "rice"
  | "bbq"
  | "vegetarian"
  | "desserts"
  | "drinks";

export interface MenuItem {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  longDescription: string;
  pricePence: number;
  portion: string;
  spice: SpiceLevel;
  allergens: string[];
  halal: boolean;
  popular?: boolean;
  weeklySpecial?: boolean;
  image: string;
  available: boolean;
}

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "curries", label: "Curries", blurb: "Slow-cooked, hand-ground masalas" },
  { id: "rice", label: "Rice & Biryani", blurb: "Aromatic basmati, dum-style" },
  { id: "bbq", label: "BBQ & Grill", blurb: "Charcoal-marinated, smoky" },
  { id: "vegetarian", label: "Vegetarian", blurb: "Garden-fresh sabzi & daal" },
  { id: "desserts", label: "Desserts", blurb: "Sweet things, made by hand" },
  { id: "drinks", label: "Drinks", blurb: "Chilled lassis & chai" },
];

// Placeholder image — admin uploads will replace later
const PLACEHOLDER = heroFeast;

export const MENU: MenuItem[] = [
  {
    id: "chicken-karahi",
    slug: "chicken-karahi",
    name: "Chicken Karahi",
    category: "curries",
    description: "Tomato, ginger, green chilli, finished with crushed coriander.",
    longDescription:
      "Our signature karahi — bone-in chicken seared in mustard oil, simmered with vine-ripened tomatoes, julienne ginger and fresh green chilli, finished tableside with crushed coriander seed and a curl of butter.",
    pricePence: 1295,
    portion: "Serves 1–2 · ~450g",
    spice: 2,
    allergens: ["Dairy"],
    halal: true,
    popular: true,
    image: "/assets/food/chicken-curry.jpg",
    available: true,
  },
  {
    id: "haleem",
    slug: "haleem",
    name: "Beef Haleem",
    category: "curries",
    description: "Lentils, wheat & slow-cooked beef, ribbon-stirred for 6 hours.",
    longDescription:
      "A Karachi-style haleem cooked low-and-slow until the wheat surrenders. Garnished with crispy fried onion, julienne ginger, mint and lemon.",
    pricePence: 1095,
    portion: "Serves 1 · ~400g",
    spice: 1,
    allergens: ["Gluten", "Dairy"],
    halal: true,
    weeklySpecial: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "daal-makhani",
    slug: "daal-makhani",
    name: "Daal Makhani",
    category: "vegetarian",
    description: "Black urad lentils, tomato, smoked butter, overnight simmered.",
    longDescription:
      "Whole black urad and red kidney beans simmered overnight on dum, finished with white butter, single cream and a kiss of smoke.",
    pricePence: 895,
    portion: "Serves 1–2 · ~400g",
    spice: 1,
    allergens: ["Dairy"],
    halal: true,
    popular: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "chicken-biryani",
    slug: "chicken-biryani",
    name: "Sindhi Chicken Biryani",
    category: "rice",
    description: "Long-grain basmati, saffron, slow-cooked thigh, plum & potato.",
    longDescription:
      "Layered dum biryani with marinated chicken thigh, golden potato, dried plum and rose. Served with raita and salan.",
    pricePence: 1195,
    portion: "Serves 1 · ~500g",
    spice: 2,
    allergens: ["Dairy", "Nuts"],
    halal: true,
    popular: true,
    image: "/assets/food/chicken-biryani.jpg",
    available: true,
  },
  {
    id: "lamb-pulao",
    slug: "lamb-pulao",
    name: "Lamb Pulao",
    category: "rice",
    description: "Lamb stock, whole spice, fried onion, mint.",
    longDescription:
      "Rice cooked in deeply reduced lamb yakhni stock with whole green cardamom, cinnamon and bay.",
    pricePence: 1295,
    portion: "Serves 1 · ~500g",
    spice: 1,
    allergens: [],
    halal: true,
    image: "/assets/food/lamb-pulao.jpg",
    available: true,
  },
  {
    id: "seekh-kebab",
    slug: "seekh-kebab",
    name: "Lamb Seekh Kebab",
    category: "bbq",
    description: "Hand-minced lamb, charcoal-grilled, mint chutney.",
    longDescription:
      "Hand-minced shoulder of lamb seasoned with roasted spice, threaded on skewers and grilled over coals. Four pieces, with mint chutney and onion.",
    pricePence: 995,
    portion: "4 skewers · ~280g",
    spice: 2,
    allergens: [],
    halal: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "chicken-tikka",
    slug: "chicken-tikka",
    name: "Chargrilled Chicken Tikka",
    category: "bbq",
    description: "Yoghurt-marinated thigh, chargrilled, lemon.",
    longDescription:
      "Boneless thigh marinated overnight in spiced yoghurt and mustard oil. Six pieces.",
    pricePence: 1095,
    portion: "6 pieces · ~300g",
    spice: 2,
    allergens: ["Dairy"],
    halal: true,
    popular: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "aloo-gobi",
    slug: "aloo-gobi",
    name: "Aloo Gobi",
    category: "vegetarian",
    description: "Cauliflower & potato, cumin, turmeric, tomato.",
    longDescription:
      "Dry-style cauliflower and waxy potato cooked with cumin, turmeric and the last of the season's tomatoes.",
    pricePence: 795,
    portion: "Serves 1–2 · ~400g",
    spice: 1,
    allergens: [],
    halal: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "gajar-halwa",
    slug: "gajar-halwa",
    name: "Gajar Ka Halwa",
    category: "desserts",
    description: "Slow-cooked carrot, milk, cardamom, pistachio.",
    longDescription:
      "Red carrot grated by hand, simmered in whole milk and ghee until jewel-thick. Cardamom, pistachio.",
    pricePence: 595,
    portion: "Serves 1 · ~180g",
    spice: 0,
    allergens: ["Dairy", "Nuts"],
    halal: true,
    weeklySpecial: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "kheer",
    slug: "kheer",
    name: "Rose & Pistachio Kheer",
    category: "desserts",
    description: "Slow-cooked rice pudding, rose, pistachio.",
    longDescription:
      "Basmati simmered in milk for two hours, perfumed with rose water and pistachio slivers.",
    pricePence: 495,
    portion: "Serves 1 · ~180g",
    spice: 0,
    allergens: ["Dairy", "Nuts"],
    halal: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "mango-lassi",
    slug: "mango-lassi",
    name: "Alphonso Mango Lassi",
    category: "drinks",
    description: "Alphonso pulp, full-fat yoghurt, cardamom.",
    longDescription:
      "Made with seasonal Alphonso pulp and whole-milk yoghurt. 330ml.",
    pricePence: 395,
    portion: "330ml",
    spice: 0,
    allergens: ["Dairy"],
    halal: true,
    image: PLACEHOLDER,
    available: true,
  },
  {
    id: "masala-chai",
    slug: "masala-chai",
    name: "Karak Masala Chai",
    category: "drinks",
    description: "Strong black tea, milk, cardamom, ginger.",
    longDescription: "Brewed to order. 330ml flask.",
    pricePence: 295,
    portion: "330ml",
    spice: 0,
    allergens: ["Dairy"],
    halal: true,
    image: PLACEHOLDER,
    available: true,
  },
];

export function getMenuItem(slug: string): MenuItem | undefined {
  return MENU.find((m) => m.slug === slug);
}

export function getPopular(): MenuItem[] {
  return MENU.filter((m) => m.popular);
}

export function getWeeklySpecials(): MenuItem[] {
  return MENU.filter((m) => m.weeklySpecial);
}

export function getByCategory(cat: Category): MenuItem[] {
  return MENU.filter((m) => m.category === cat);
}
