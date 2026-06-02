import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Homemade Pakistani Kitchen" },
      {
        name: "description",
        content: "Get in touch with Homemade Pakistani Kitchen in Surrey — by phone, WhatsApp or email.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-xs uppercase tracking-[0.2em] text-primary">Contact</div>
      <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
        Say hello.
      </h1>
      <p className="mt-3 text-muted-foreground">
        For order changes, special requests or large catering, the fastest way to reach us is WhatsApp.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value="+44 7000 000000" href="https://wa.me/447000000000" />
        <Card icon={<Phone className="h-5 w-5" />} label="Phone" value="+44 7000 000000" href="tel:+447000000000" />
        <Card icon={<Mail className="h-5 w-5" />} label="Email" value="hello@hpkitchen.co.uk" href="mailto:hello@hpkitchen.co.uk" />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-xl">Kitchen hours</h2>
        <ul className="mt-3 grid gap-1 text-sm text-foreground/85 sm:grid-cols-2">
          <li><strong>Monday – Friday</strong> · 10:00 – 21:00</li>
          <li><strong>Saturday</strong> · 11:00 – 22:00</li>
          <li><strong>Sunday</strong> · 12:00 – 21:00</li>
          <li className="text-muted-foreground">Same-day cut-off: 10:30am</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a href={href} className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs uppercase tracking-wider">{label}</span></div>
      <div className="mt-2 font-display text-lg text-foreground">{value}</div>
    </a>
  );
}
