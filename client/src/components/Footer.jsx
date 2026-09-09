import React from "react";
import { Sprout, Phone, MessageSquare, Clock, MapPin, Heart } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";

export default function Footer() {
  const { cart } = useCart();
  const {
    storeName,
    tagline,
    timings,
    deliveryInfo,
    whatsappNumber,
    phoneNumber
  } = useSettings();

  return (
    <footer className={`footer-wrapper ${cart.length > 0 ? "has-sticky-cart" : ""}`}>
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "var(--primary-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff"
                }}
              >
                <Sprout size={20} />
              </div>
              <h3 className="footer-brand-title">{storeName}</h3>
            </div>
            <p className="footer-brand-tagline">“{tagline}”</p>
            <p className="footer-brand-desc">
              Dedicated to delivering the freshest handpicked farm vegetables straight to local families with unmatched speed, honesty, and care.
            </p>
          </div>

          {/* Delivery & Timings */}
          <div>
            <h4 className="footer-heading">Delivery & Timings</h4>
            <ul className="footer-info-list">
              <li className="footer-info-item">
                <Clock size={18} style={{ color: "var(--primary-300)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Hours:</strong> {timings}
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {siteConfig.operatingDays}
                  </div>
                </div>
              </li>
              <li className="footer-info-item">
                <MapPin size={18} style={{ color: "var(--primary-300)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Delivery Zone:</strong> {deliveryInfo}
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {siteConfig.delivery.estimatedTime}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & WhatsApp Order */}
          <div>
            <h4 className="footer-heading">Direct Contact</h4>
            <ul className="footer-info-list">
              <li className="footer-info-item">
                <MessageSquare size={18} style={{ color: "var(--whatsapp-green)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>WhatsApp Order Line:</strong>
                  <div>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--whatsapp-green)", fontWeight: 700 }}
                    >
                      {phoneNumber || whatsappNumber}
                    </a>
                  </div>
                </div>
              </li>
              <li className="footer-info-item">
                <Phone size={18} style={{ color: "var(--primary-300)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Customer Support:</strong>
                  <div>{phoneNumber || whatsappNumber}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {storeName || "Kheti Se"}. All Rights Reserved.
          </div>
          <div className="footer-bottom-dev">
            Developed by:{" "}
            <a
              href="https://santoshvarma.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
            >
              santosh.dev
            </a>
          </div>
          <div className="footer-bottom-love">
            <span>Farm fresh goodness with</span>
            <Heart size={14} style={{ color: "#ef4444", fill: "#ef4444", display: "inline-block", verticalAlign: "middle" }} />
            <span>for healthy homes.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
