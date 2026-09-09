import React from "react";
import { ShoppingBasket, MessageSquare, CheckCircle, Truck, Sparkles } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: <ShoppingBasket size={24} />,
      title: "Select Your Vegetables",
      desc: "Browse today's fresh harvest, choose your desired quantities, and add them to your basket."
    },
    {
      num: "02",
      icon: <MessageSquare size={24} />,
      title: "Order on WhatsApp",
      desc: "Tap checkout to auto-format your order list and send it with one tap to our WhatsApp."
    },
    {
      num: "03",
      icon: <CheckCircle size={24} />,
      title: "Instant Confirmation",
      desc: "Our team instantly confirms your items, total bill, and shares your live delivery ETA."
    },
    {
      num: "04",
      icon: <Truck size={24} />,
      title: "Fresh Home Delivery",
      desc: "Carefully sorted vegetables are delivered fresh to your doorstep within hours."
    }
  ];

  return (
    <section className="section how-it-works-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={14} />
            <span>How It Works</span>
          </div>
          <h2 className="section-title">Simple. Fresh. Delivered.</h2>
          <p className="section-subtitle">
            Zero sign-up required. Order pure farm-fresh vegetables in 4 straightforward steps in less than a minute.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s, idx) => (
            <div key={idx} className="step-card">
              <span className="step-number-badge">{s.num}</span>
              <div className="step-icon-box">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
