const { DISHES } = require("../src/lib/menu-data");

const fs = require("fs");

const data = DISHES.map((d) => ({
  id: d.id,
  slug: d.slug,
  name: d.name,
  category: d.category,
  description: d.description,
  longDescription: d.longDescription,
  spice: d.spice,
  allergens: d.allergens,
  halal: d.halal,
  popular: d.popular || false,
  weeklySpecial: d.weeklySpecial || false,
  image: d.image,
  available: d.available,
  sizes: d.sizes,
}));

fs.writeFileSync("menu.json", JSON.stringify(data, null, 2));

console.log("✅ menu.json generated");
