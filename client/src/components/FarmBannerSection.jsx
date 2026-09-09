import React from "react";
import { CheckCircle, Sprout, Heart, Sun, ShieldCheck } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function FarmBannerSection({ onLearnMoreClick }) {
  const { storeName } = useSettings();
  const farmPillars = [
    { text: "Locally Sourced", icon: Sprout },
    { text: "Better Nutrition", icon: Heart },
    { text: "Seasonal Freshness", icon: Sun },
    { text: "Sustainable Farming", icon: ShieldCheck }
  ];

  return (
    <section id="about-us-section" className="farm-story-section">
      <div id="farm-story-section" />
      <div className="container">
        <div className="farm-story-card">
          {/* Left Farmer Visual with natural gradient mask */}
          <div className="farm-story-image-box">
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&auto=format&fit=crop&q=80"
              alt="Assortment of fresh, healthy colorful vegetables and greens"
              className="farm-farmer-img"
              loading="lazy"
            />
            <div className="farmer-overlay-gradient" />
          </div>

          {/* Middle Narrative Content */}
          <div className="farm-story-content">
            <div className="farm-support-pill">
              <span>About Us • 100% Healthy & Chemical-Free</span>
            </div>

            <h2 className="farm-story-heading">
              About <span className="story-heading-green" style={{ color: "var(--primary-600)" }}>{storeName || "Kheti Se"}</span> <br />
              <span className="story-heading-dark">Naturally Grown for Good Health</span>
            </h2>

            <p className="farm-story-desc">
              Packed with essential vitamins, minerals, and wholesome nutrition. Enjoy 100% chemical-free vegetables harvested daily to keep your family healthy and energized.
            </p>
          </div>

          {/* Right Floating Highlights Card */}
          <div className="farm-story-pillars-box">
            <div className="pillars-white-card">
              {farmPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="pillar-item">
                    <div className="pillar-icon-circle">
                      <Icon size={16} strokeWidth={2.4} />
                    </div>
                    <span className="pillar-text">{pillar.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
