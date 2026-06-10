import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/site/meal-card";
import { DELIVERY_FEE_PENCE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import heroFeast from "@/assets/hero-feast.jpg";
import menuData from "@/data/menu.json";
import { setSelectedDeliveryDate } from "@/lib/cart-store";

/* ---------------- TYPES ---------------- */

type MenuDish = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  available: string[];
  image: string;
  sizes: any[];
};

type DayOption = {
  key: string;
  label: string;
  weekday: string;
};

type SlotTile = {
  id: "breakfast" | "lunch" | "dinner";
  title: string;
  time: string;
  available: boolean;
  reason?: string;
};

/* ---------------- HELPERS ---------------- */

function getWeekdayName(date: Date) {
  return date
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function isAvailable(item: MenuDish, day: string) {
  return item.available.includes("daily") || item.available.includes(day);
}

function getDeliveryDayOptions(): DayOption[] {
  const today = new Date();
  const options: DayOption[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const weekday = getWeekdayName(d);

    let label = formatDay(weekday);
    if (i === 0) label = "Today";
    if (i === 1) label = "Tomorrow";

    options.push({
      key: d.toISOString().slice(0, 10),
      label,
      weekday,
    });
  }

  return options;
}

function getUkNowParts() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((p) => [p.type, p.value])
  );

  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return minutes;
}

/* ---------------- SLOT LOGIC ---------------- */

function getSlotTiles(minutes: number): SlotTile[] {
  return [
    {
      id: "lunch",
      title: "Lunch",
      time: "12:00 – 14:30",
      available: minutes < 9 * 60,
    },
    {
      id: "dinner",
      title: "Dinner",
      time: "17:00 – 19:30",
      available: minutes < 15 * 60,
    },
    {
      id: "breakfast",
      title: "Weekend Breakfast",
      time: "10:00 – 12:00",
      available: minutes < 8 * 60,
    },
  ];
}

/* ---------------- COMPONENT ---------------- */

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const menu = menuData as MenuDish[];

  const dayOptions = useMemo(() => getDeliveryDayOptions(), []);
  const nowMinutes = getUkNowParts();

  // ✅ AUTO SWITCH AFTER 15:00
  const initialDate =
    nowMinutes >= 15 * 60 ? dayOptions[1].key : dayOptions[0].key;

  const [selectedDateKey, setSelectedDateKey] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDeliveryDate(selectedDateKey);
  }, [selectedDateKey]);

  const selectedDay = dayOptions.find(d => d.key === selectedDateKey)!;
  const selectedWeekday = selectedDay.weekday;

  const selectedDayMenu = menu.filter((item) =>
    isAvailable(item, selectedWeekday)
  );

  const fullWeekMenu = [...menu];

  const slots = getSlotTiles(nowMinutes);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <img src={heroFeast} className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative p-20 text-white">
          <h1 className="text-5xl">ZAIQA</h1>
        </div>
      </section>

      {/* DATE PICKER */}
      <section className="max-w-6xl mx-auto p-4">
        <div className="flex gap-2">
          {dayOptions.map((d, i) => {
            const isClosed = i === 0 && nowMinutes >= 15 * 60;
            return (
              <button
                key={d.key}
                disabled={isClosed}
                onClick={() => setSelectedDateKey(d.key)}
                className={`px-4 py-2 rounded ${
                  isClosed ? "opacity-40" : ""
                }`}
              >
                {isClosed ? "Today (closed)" : d.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ✅ DELIVERY (MOVED HERE) */}
      <section className="max-w-6xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Choose Delivery Slot</h2>

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          {slots
            .filter(s => s.id !== "breakfast")
            .map(slot => (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.id)}
                className={`p-4 border rounded ${
                  selectedSlot === slot.id ? "border-black" : ""
                }`}
              >
                {slot.title}
              </button>
            ))}
        </div>

        {/* Row 2 */}
        <div className="mt-4">
          {slots
            .filter(s => s.id === "breakfast")
            .map(slot => (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.id)}
                className="p-4 border rounded w-full"
              >
                {slot.title}
              </button>
            ))}
        </div>
      </section>

      {/* MENU */}
      <section className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {selectedDayMenu.map(d => (
            <MealCard key={d.id} item={d} />
          ))}
        </div>
      </section>

      {/* FULL WEEK */}
      <section className="max-w-6xl mx-auto p-4">
        {fullWeekMenu.map(d => (
          <div key={d.id}>{d.name}</div>
        ))}
      </section>
    </>
  );
}
