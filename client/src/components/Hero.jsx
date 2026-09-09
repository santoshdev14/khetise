import React from "react";
import { ArrowDown, CheckCircle2, Truck, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { siteConfig } from "../config/siteConfig";
import { useSettings } from "../context/SettingsContext";

export default function Hero({ onShopClick }) {
  const { whatsappNumber, tagline } = useSettings();

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Hero Content */}
          <div className="hero-content">
            <div className="hero-pill-badge">
              <span className="pulse-circle" />
              <span>Today's Farm Harvest Available</span>
            </div>

            <h1 className="hero-heading">
              Taazgi Jo <span className="gradient-text">Seedha Khet Se</span> Aaye
            </h1>

            <p className="hero-subheading">
              {tagline ? `${tagline}. ` : ""}{siteConfig.description} Handpicked crisp vegetables from verified local farms, washed, graded, and delivered fresh to your kitchen.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="btn-primary-hero"
                onClick={onShopClick}
              >
                <span>Shop Fresh Vegetables</span>
                <ArrowDown size={18} />
              </button>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Namaste! I would like to inquire about today's fresh vegetables.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-hero"
              >
                <span>Direct Inquiry</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="hero-trust-row">
              <div className="trust-item">
                <div className="trust-item-icon">
                  <ShieldCheck size={16} />
                </div>
                <span>Fresh & Quality Checked</span>
              </div>

              <div className="trust-item">
                <div className="trust-item-icon">
                  <Truck size={16} />
                </div>
                <span>Same-Day Delivery</span>
              </div>

              <div className="trust-item">
                <div className="trust-item-icon">
                  <Sprout size={16} />
                </div>
                <span>100% Local & Fresh</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="hero-visual-card">
            <img
              src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&auto=format&fit=crop&q=80"
              alt="Fresh Indian Farm Vegetables Basket"
              className="hero-visual-img"
              loading="eager"
            />
            <div className="hero-floating-badge">
              <div>
                <div className="floating-badge-title">100% Farm Fresh Guaranteed</div>
                <div className="floating-badge-sub">Harvested this morning & sorted with care</div>
              </div>
              <span className="floating-badge-tag">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
