import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "447000000000"; // placeholder UK number

export function WhatsAppFab() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I'd like to ask about an order.",
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_30px_-8px_rgb(37,211,102,0.55)] transition-transform hover:scale-105"
      style={{ background: "#25D366" }}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
