import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Where do you deliver?",
    a: "We deliver to Byfleet, West Byfleet, Woking and Weybridge. If you're nearby, message us on WhatsApp — we may still be able to help.",
  },
  {
    q: "Is your food halal?",
    a: "Yes — 100% halal, from a butcher we've used for years. We never cook with alcohol or non-halal stocks.",
  },
  {
    q: "What's the cut-off for same-day delivery?",
    a: "Orders placed before 10:30am are delivered the same day (lunch or dinner slot). After 10:30am, our calendar will only show future dates.",
  },
  {
    q: "How much is delivery?",
    a: "A flat £1.99 across our delivery zones.",
  },
  {
    q: "Is there a minimum order?",
    a: "Yes — £15. It just helps us cover ingredients and time honestly.",
  },
  {
    q: "Do you cater to allergies?",
    a: "We list allergens on each dish. Our kitchen handles nuts, dairy, gluten and sesame, so we can't guarantee no cross-contact. If you have severe allergies, please add a note at checkout.",
  },
  {
    q: "How do I pay?",
    a: "Card payment via Stripe at checkout. Your order is only confirmed once payment succeeds.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "Yes, up to 2 hours before your slot. WhatsApp is the fastest way to reach us.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Homemade Pakistani Kitchen" },
      { name: "description", content: "Answers to common questions about ordering Pakistani home food in Surrey." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-xs uppercase tracking-[0.2em] text-primary">FAQ</div>
      <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
        Things people ask.
      </h1>

      <Accordion type="single" collapsible className="mt-8">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
            <AccordionContent className="text-foreground/85">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
