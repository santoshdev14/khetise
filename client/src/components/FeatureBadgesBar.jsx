import React from "react";
import { Leaf, ShieldCheck, Truck, Award } from "lucide-react";

export default function FeatureBadgesBar() {
  const badges = [
    {
      icon: Leaf,
      title: "100% Fresh",
      subtitle: "Handpicked Daily"
    },
    {
      icon: ShieldCheck,
      title: "No Harmful Chemicals",
      subtitle: "Safe for Your Family"
    },
    {
      icon: Truck,
      title: "Same-Day Delivery",
      subtitle: "Fresh at Your Doorstep"
    },
    {
      icon: Award,
      title: "Premium Quality",
      subtitle: "No Pesticides, No Chemicals"
    }
  ];

  return (
    <section className="feature-badges-section">
      <div className="container">
        <div className="feature-badges-card">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="feature-badge-item">
                <div className="feature-badge-icon-box">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div className="feature-badge-text">
                  <span className="feature-badge-title">{badge.title}</span>
                  <span className="feature-badge-subtitle">{badge.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
