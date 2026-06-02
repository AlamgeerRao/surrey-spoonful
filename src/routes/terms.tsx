import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Homemade Pakistani Kitchen" },
      { name: "description", content: "The terms that apply when you order from Homemade Pakistani Kitchen." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="prose prose-lg mx-auto max-w-3xl px-4 py-12 text-foreground/90 sm:px-6 sm:py-16">
      <h1 className="font-display">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

      <h2 className="font-display">Ordering</h2>
      <p>
        Orders placed before 10:30am are eligible for same-day lunch or dinner
        delivery. After 10:30am, the earliest available delivery is the next
        day. Minimum order £15. Delivery £1.99 across our zones (Byfleet, West
        Byfleet, Woking, Weybridge).
      </p>

      <h2 className="font-display">Payment</h2>
      <p>
        Payment is taken at checkout via Stripe. Your order is confirmed once
        payment succeeds. You'll receive an email confirmation and, if SMS is
        enabled, a text with status updates.
      </p>

      <h2 className="font-display">Cancellations & refunds</h2>
      <p>
        You can cancel or change your order up to 2 hours before your delivery
        slot for a full refund. After this point, ingredients are already in the
        pan — we can't refund.
      </p>

      <h2 className="font-display">Allergens</h2>
      <p>
        We list allergens on every dish. Our kitchen handles nuts, dairy,
        gluten and sesame; cross-contact cannot be ruled out. If you have
        severe allergies please let us know in the order notes.
      </p>

      <h2 className="font-display">Liability</h2>
      <p>
        We take care of every dish, but we can't accept liability for losses
        beyond the cost of the order itself, except where required by law.
      </p>
    </article>
  );
}
