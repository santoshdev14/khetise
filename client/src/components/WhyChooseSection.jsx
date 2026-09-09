import React from "react";
import { ShieldCheck, Truck, Sparkles, Tag, Heart } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function WhyChooseSection() {
  const { storeName } = useSettings();
  const reasons = [
    {
      icon: ShieldCheck,
      title: "100% Natural",
      desc: "No chemicals, no shortcuts."
    },
    {
      icon: Truck,
      title: "Doorstep Delivery",
      desc: "Delivered fresh straight to your home."
    },
    {
      icon: Sparkles,
      title: "Wide Variety",
      desc: "All your favorite veggies."
    },
    {
      icon: Tag,
      title: "Affordable Prices",
      desc: "Premium quality, best value."
    }
  ];

  return (
    <section id="why-us-section" className="why-choose-section">
      <div className="container">
        <div className="why-choose-top">
          <div className="why-choose-header-text">
            <h2 className="why-choose-title">
              Why Choose <span className="title-green">{storeName || "KhetiSe"}</span>?
            </h2>
            <p className="why-choose-subtitle">
              More than just vegetables — it's a promise of freshness, health and happiness.
            </p>
          </div>

          {/* Right Script Signature Badge */}
          <div className="healthy-happy-badge">
            <div className="badge-text-script">
              <span>Healthy Food</span>
              <span className="happy-script">Happy You</span>
            </div>
            <div className="badge-heart-icon">
              <Heart size={16} fill="#16a34a" stroke="#16a34a" />
            </div>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="why-reasons-grid">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="why-reason-card">
                <div className="why-icon-bubble">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="why-card-title">{item.title}</h3>
                <p className="why-card-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
