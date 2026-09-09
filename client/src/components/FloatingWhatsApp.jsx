import React from "react";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";

function WhatsAppBrandIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.4 1.34-1.94 1.42-.51.08-1.18.11-3.41-.81-2.85-1.18-4.69-4.08-4.83-4.27-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.28.63-.4 1-.4.12 0 .23.01.33.01.29.01.44.03.63.49.24.58.82 2.01.89 2.16.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.15-.31.31-.13.62.18.31.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.15.28.11 1.78.84 2.09.99.31.15.52.23.6.36.08.13.08.77-.16 1.45z" />
    </svg>
  );
}

export default function FloatingWhatsApp() {
  const { whatsappNumber, storeName } = useSettings();
  const { totalItemsCount } = useCart();

  const cleanWhatsAppNumber = String(whatsappNumber || "").replace(/[^0-9]/g, "");
  const defaultHelpMsg = encodeURIComponent(
    `Namaste ${storeName || "Kheti Se"}! I have a question about today's vegetable availability and delivery.`
  );

  return (
    <a
      href={`https://api.whatsapp.com/send/?phone=${cleanWhatsAppNumber}&text=${defaultHelpMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`floating-whatsapp-btn ${totalItemsCount > 0 ? "has-sticky-cart" : ""}`}
      aria-label={`Chat with ${storeName || "Kheti Se"} on WhatsApp`}
      title="Chat on WhatsApp"
    >
      <WhatsAppBrandIcon size={30} />
      <span className="floating-whatsapp-tooltip">Chat with Farm Desk</span>
    </a>
  );
}

