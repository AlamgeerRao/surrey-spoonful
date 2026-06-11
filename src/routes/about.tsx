import { createFileRoute } from "@tanstack/react-router";
import heroFeast from "@/assets/hero-feast.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our story — Homemade Pakistani Kitchen, Surrey" },
      {
        name: "description",
        content:
          "A family kitchen in Surrey, cooking the Pakistani food we grew up with. Halal, hand-cooked, delivered fresh.",
      },
      { property: "og:title", content: "Our story — Homemade Pakistani Kitchen" },
      { property: "og:image", content: heroFeast },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-xs uppercase tracking-[0.2em] text-primary">About</div>
      <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
        A family kitchen in Surrey.
      </h1>

      <div className="prose prose-lg mt-8 max-w-none text-foreground/85">
        <p>
          Homemade Pakistani Kitchen started, like a lot of small good things,
          with a question from a neighbour: <em>"could you cook a little extra for us
          this Sunday?"</em>
        </p>
        <p>
          We make the food we grew up eating in Karachi and Lahore — slow-cooked
          karahi from a real kadhai, dum biryani layered by hand, daal that
          takes a full day to come together. Nothing is rushed. Nothing is
          frozen. The masalas are ground in our kitchen. The meat is halal, from
          a butcher we've been going to for years.
        </p>

        <h2 className="font-display">What we believe</h2>
        <ul>
          <li>Real ingredients. No shortcuts.</li>
          <li>Halal, always.</li>
          <li>Small batches, cooked the day they go out.</li>
          <li>Honest pricing — what it costs to feed family.</li>
        </ul>

        <h2 className="font-display">Where we deliver</h2>
        <p>
          We hand-deliver across <strong>Byfleet, West Byfleet, Woking and
          Weybridge</strong> for lunch and dinner. Order before 10:30am for
          same-day, or schedule any future date — your call.
        </p>
      </div>
    </article>
  );
}
