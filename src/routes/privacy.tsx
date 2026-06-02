import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Homemade Pakistani Kitchen" },
      { name: "description", content: "How we handle your personal information." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="prose prose-lg mx-auto max-w-3xl px-4 py-12 text-foreground/90 sm:px-6 sm:py-16">
      <h1 className="font-display">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>

      <p>
        Homemade Pakistani Kitchen ("we", "us") respects your privacy. This
        policy explains what data we collect when you order from us, why, and
        what your rights are under UK GDPR.
      </p>

      <h2 className="font-display">What we collect</h2>
      <ul>
        <li>Your name, mobile number and email — to confirm and deliver your order.</li>
        <li>Your delivery address — to deliver your food.</li>
        <li>Order history — for receipts and to make repeat orders easier.</li>
        <li>Payment is processed by Stripe — we never see or store your card details.</li>
      </ul>

      <h2 className="font-display">How we use it</h2>
      <p>
        Strictly to fulfil your order and contact you about it. We do not sell
        your information. We don't send marketing unless you've opted in.
      </p>

      <h2 className="font-display">Your rights</h2>
      <p>
        You can ask us to delete or export your data at any time by emailing{" "}
        <a href="mailto:hello@hpkitchen.co.uk">hello@hpkitchen.co.uk</a>.
      </p>

      <h2 className="font-display">Cookies</h2>
      <p>
        We use essential cookies to remember your basket and checkout. With
        your consent we may use analytics cookies to understand how the site is
        used. You can manage your choice from the cookie banner at any time.
      </p>
    </article>
  );
}
