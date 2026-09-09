import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { bannerService } from "../services/bannerService";

export default function HeroBanner({ onShopClick }) {
  const {
    settings,
    heroBadge,
    heroTitlePrefix,
    heroTitleHighlight,
    heroSubtitle,
    heroDiscountBadge,
    heroCtaText,
    heroImageUrl
  } = useSettings();

  const [dbBanners, setDbBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch active banners from DB
  const loadBanners = useCallback(async () => {
    try {
      const data = await bannerService.getActiveBanners();
      if (Array.isArray(data) && data.length > 0) {
        setDbBanners(data);
      }
    } catch (err) {
      console.warn("Failed to load active hero banners from DB:", err);
    }
  }, []);

  useEffect(() => {
    loadBanners();

    // Listen for real-time banner update events from admin panel
    const handleBannersUpdated = () => {
      loadBanners();
    };
    window.addEventListener("kheti_banners_updated", handleBannersUpdated);
    return () => {
      window.removeEventListener("kheti_banners_updated", handleBannersUpdated);
    };
  }, [loadBanners]);

  // Transform database banners into slide items, with reliable fallback
  const slides = useMemo(() => {
    if (dbBanners.length > 0) {
      return dbBanners.map((b) => ({
        id: b.id,
        badge: b.badgeText || heroBadge || "100% Fresh & Organic",
        titlePrefix: b.title || heroTitlePrefix || "Nature's Goodness",
        titleHighlight: b.highlightText || heroTitleHighlight || "Straight to Your Plate",
        subtitle:
          b.subtitle ||
          heroSubtitle ||
          "Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family.",
        discount: b.discountBadge || heroDiscountBadge || "UP TO 40% OFF ON SELECTED VEGETABLES",
        cta: b.primaryCtaText || heroCtaText || "Shop Fresh Vegetables",
        image:
          b.imageUrl ||
          heroImageUrl ||
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85"
      }));
    }

    // Fallback if DB fetch is pending or empty
    return [
      {
        id: 1,
        badge: heroBadge || "100% Fresh & Organic",
        titlePrefix: heroTitlePrefix || "Nature's Goodness",
        titleHighlight: heroTitleHighlight || "Straight to Your Plate",
        subtitle:
          heroSubtitle ||
          "Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family.",
        discount: heroDiscountBadge || "UP TO 40% OFF ON SELECTED VEGETABLES",
        cta: heroCtaText || "Shop Fresh Vegetables",
        image:
          heroImageUrl ||
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85"
      }
    ];
  }, [
    dbBanners,
    heroBadge,
    heroTitlePrefix,
    heroTitleHighlight,
    heroSubtitle,
    heroDiscountBadge,
    heroCtaText,
    heroImageUrl
  ]);

  const slide = slides[currentSlide] || slides[0];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Auto slide every 7 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="kheti-hero-section">
      <div className="container">
        <div className="kheti-hero-banner">
          {/* Background Image with subtle zoom transition */}
          <div
            className="kheti-hero-bg"
            style={{
              backgroundImage: `url(${slide.image})`
            }}
          />
          <div className="kheti-hero-overlay" />

          {/* Top Bar inside hero banner: Pill on left, Discount stamp on right */}
          <div className="hero-top-badges-bar">
            {slide.badge && (
              <div className="hero-organic-pill">
                <span className="pill-check-icon">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>{slide.badge}</span>
              </div>
            )}

            {slide.discount && (() => {
              const str = (slide.discount || "").trim();
              const hasUpTo = /^UP\s*TO/i.test(str);
              const percentMatch = str.match(/\d+%\s*OFF/i);
              const percent = percentMatch ? percentMatch[0].toUpperCase() : "40% OFF";
              const afterPercent = percentMatch ? str.substring(percentMatch.index + percentMatch[0].length).trim() : "";
              const sub = afterPercent
                ? (afterPercent.toUpperCase().startsWith("ON") ? afterPercent.toUpperCase() : `ON ${afterPercent.toUpperCase()}`)
                : "ON SELECTED VEGETABLES";

              return (
                <div className="hero-discount-stamp">
                  <span className="stamp-label">{hasUpTo ? "UP TO" : "SPECIAL OFFER"}</span>
                  <span className="stamp-percent">{percent}</span>
                  <span className="stamp-sub">{sub}</span>
                </div>
              );
            })()}
          </div>

          {/* Hero Content Area */}
          <div className="kheti-hero-content">
            {/* Big Headline */}
            <h1 className="hero-headline">
              {slide.titlePrefix} <br />
              <span className="hero-headline-green">{slide.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-description">{slide.subtitle}</p>

            {/* CTA Button */}
            <button
              type="button"
              className="hero-shop-btn"
              onClick={onShopClick}
              aria-label="Shop fresh vegetables now"
            >
              <span>{slide.cta}</span>
              <span className="btn-arrow-circle">
                <ArrowRight size={16} />
              </span>
            </button>

            {/* Carousel Dots */}
            <div className="hero-pagination-dots" role="tablist">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`hero-dot ${currentSlide === idx ? "active" : ""}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Left / Right Carousel Controls (Hidden on Mobile) */}
          <button
            type="button"
            className="hero-nav-arrow hero-arrow-left"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="hero-nav-arrow hero-arrow-right"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
