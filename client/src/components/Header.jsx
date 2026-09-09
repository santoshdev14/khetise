import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  QrCode, 
  Search, 
  User, 
  Sprout, 
  Menu, 
  X,
  LogIn
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";

export default function Header({ searchQuery = "", setSearchQuery, onNavigateSection }) {
  const { totalItemsCount, setIsCartOpen, setIsQRModalOpen } = useCart();
  const { storeName, tagline } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  // Keep header active nav item matched to current page section content while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      if (window.scrollY < 200) {
        setActiveNav("home");
        return;
      }
      const sections = [
        { id: "why-us-section", key: "why" },
        { id: "about-us-section", key: "about" },
        { id: "products-section", key: "shop" },
      ];
      for (const sec of sections) {
        const el = document.getElementById(sec.id) || (sec.id === "about-us-section" ? document.getElementById("farm-story-section") : null);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNav(sec.key);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId, navKey) => {
    setActiveNav(navKey);
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId) || (sectionId === "about-us-section" ? document.getElementById("farm-story-section") : null);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onNavigateSection) {
      onNavigateSection("products-section");
    }
  };

  return (
    <header className="kheti-header">
      <div className="header-inner">
        {/* Left: Brand Logo & Tagline */}
        <a 
          href="#" 
          className="kheti-brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setActiveNav("home");
          }}
        >
          <div className="kheti-brand-icon">
            <Sprout size={22} strokeWidth={2.4} />
          </div>
          <div className="kheti-brand-text">
            <div className="kheti-logo-name">
              {(() => {
                const words = (storeName || "Kheti Se").trim().split(/\s+/);
                if (words.length > 1) {
                  return (
                    <>
                      <span className="logo-dark">{words[0]}</span>
                      <span className="logo-green"> {words.slice(1).join(" ")}</span>
                    </>
                  );
                }
                return <span className="logo-green">{storeName || "Kheti Se"}</span>;
              })()}
            </div>
            <span className="kheti-logo-tagline">{tagline || "Freshness Directly from Farm"}</span>
          </div>
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="kheti-nav-desktop" aria-label="Main Navigation">
          <button 
            type="button" 
            className={`kheti-nav-link ${activeNav === "home" ? "active" : ""}`}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActiveNav("home");
            }}
          >
            Home
          </button>
          <button 
            type="button" 
            className={`kheti-nav-link ${activeNav === "shop" ? "active" : ""}`}
            onClick={() => handleNavClick("products-section", "shop")}
          >
            Shop
          </button>
          <button 
            type="button" 
            className={`kheti-nav-link ${activeNav === "about" ? "active" : ""}`}
            onClick={() => handleNavClick("about-us-section", "about")}
          >
            About Us
          </button>
          <button 
            type="button" 
            className={`kheti-nav-link ${activeNav === "why" ? "active" : ""}`}
            onClick={() => handleNavClick("why-us-section", "why")}
          >
            Why Us
          </button>
        </nav>

        {/* Right: Search, Header QR, User, Cart */}
        <div className="kheti-header-right">
          {/* Search Input Bar */}
          <form className="kheti-header-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search fresh vegetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="kheti-search-input"
              aria-label="Search vegetables"
            />
            <button type="submit" className="kheti-search-btn" title="Search">
              <Search size={16} />
            </button>
          </form>

          {/* QR Code Scanner Button - "Scan to Open on Mobile" */}
          <button
            type="button"
            className="kheti-icon-btn kheti-qr-header-btn"
            onClick={() => setIsQRModalOpen(true)}
            title="Scan QR Code to open site on phone"
            aria-label="Scan QR Code to open on phone"
          >
            <QrCode size={18} />
            <span className="qr-badge-hint">Scan QR</span>
          </button>

          {/* User Profile / Admin Link (Desktop Only) */}
          <Link
            to="/admin/login"
            className="kheti-icon-btn kheti-user-btn"
            title="Admin Login / Profile"
            aria-label="Admin Login"
          >
            <User size={18} />
          </Link>

          {/* Cart Icon with badge count */}
          <button
            type="button"
            className="kheti-icon-btn kheti-cart-btn"
            onClick={() => setIsCartOpen(true)}
            title="Open Shopping Cart"
            aria-label="Shopping Cart"
          >
            <div className="cart-icon-wrapper">
              <ShoppingBag size={19} />
              <span className="kheti-cart-badge">{totalItemsCount}</span>
            </div>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="kheti-mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="kheti-mobile-drawer">
          {/* Mobile Search */}
          <div className="mobile-search-row">
            <input
              type="text"
              placeholder="Search vegetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="kheti-search-input"
            />
          </div>

          <div className="mobile-nav-links">
            <button
              type="button"
              className={`mobile-nav-item ${activeNav === "home" ? "active" : ""}`}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setActiveNav("home");
                setMobileMenuOpen(false);
              }}
            >
              Home
            </button>
            <button
              type="button"
              className={`mobile-nav-item ${activeNav === "shop" ? "active" : ""}`}
              onClick={() => handleNavClick("products-section", "shop")}
            >
              Shop
            </button>
            <button
              type="button"
              className={`mobile-nav-item ${activeNav === "about" ? "active" : ""}`}
              onClick={() => handleNavClick("about-us-section", "about")}
            >
              About Us
            </button>
            <button
              type="button"
              className={`mobile-nav-item ${activeNav === "why" ? "active" : ""}`}
              onClick={() => handleNavClick("why-us-section", "why")}
            >
              Why Us
            </button>
            <Link
              to="/admin/login"
              className="mobile-nav-item"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <LogIn size={16} />
              <span>Admin Login</span>
            </Link>
          </div>

          <div className="mobile-drawer-bottom">
            <button
              type="button"
              className="mobile-qr-share-btn"
              onClick={() => {
                setIsQRModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <QrCode size={18} />
              <span>Scan QR / Open on Phone</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
