import React from "react";
import { Sprout, Tractor, ShieldCheck, Home } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Sprout size={28} />,
      title: "100% Fresh Vegetables",
      desc: "Crisp, naturally grown vegetables harvested daily at dawn from local partner farmers."
    },
    {
      icon: <Tractor size={28} />,
      title: "Direct Farm-to-Home",
      desc: "Zero middlemen, zero cold storage delays. You get the purest farm produce directly."
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "3-Step Quality Checked",
      desc: "Every single piece is manually inspected, washed, graded, and packed for safe consumption."
    },
    {
      icon: <Home size={28} />,
      title: "Speedy Home Delivery",
      desc: "Safe, contactless same-day delivery right to your kitchen doorsteps with no hassle."
    }
  ];

  return (
    <section className="section" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Sprout size={14} />
            <span>The Kheti Se Promise</span>
          </div>
          <h2 className="section-title">Why Choose Kheti Se?</h2>
          <p className="section-subtitle">
            We are redefining how your family gets daily greens with uncompromising farm freshness and transparent local sourcing.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((b, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-icon-wrapper">{b.icon}</div>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
