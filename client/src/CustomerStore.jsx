import React, { useState, useMemo, useRef } from "react";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import FeatureBadgesBar from "./components/FeatureBadgesBar";
import CategoryExplore from "./components/CategoryExplore";
import FreshPicksSection from "./components/FreshPicksSection";
import FarmBannerSection from "./components/FarmBannerSection";
import WhyChooseSection from "./components/WhyChooseSection";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import MobileStickyCart from "./components/MobileStickyCart";
import ShareQRModal from "./components/ShareQRModal";
import Footer from "./components/Footer";
import { useProducts } from "./context/ProductsContext";
import { useCart } from "./context/CartContext";
import { useSettings } from "./context/SettingsContext";
import { CheckCircle2 } from "lucide-react";

export default function CustomerStore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const productsRef = useRef(null);

  const { products, isLoading, error, refreshProducts } = useProducts();
  const { toastMessage, showToast } = useCart();
  const { storeName, tagline } = useSettings();

  // Dynamically update document title based on store name
  React.useEffect(() => {
    if (storeName) {
      document.title = `${storeName} - ${tagline || "Freshness Directly from Farm"}`;
    }
  }, [storeName, tagline]);

  // Smart filtering based on category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Category Matching
      let matchesCategory = true;
      if (activeCategory !== "all") {
        const catName = (item.category || "").toLowerCase();
        const itemName = (item.name || "").toLowerCase();
        const hindiName = (item.hindiName || "").toLowerCase();

        switch (activeCategory) {
          case "leafy-greens":
            matchesCategory =
              catName.includes("leaf") ||
              itemName.includes("spinach") ||
              itemName.includes("palak") ||
              itemName.includes("coriander") ||
              itemName.includes("mint") ||
              hindiName.includes("पालक") ||
              hindiName.includes("धनिया");
            break;
          case "daily-essentials":
            matchesCategory =
              catName.includes("daily") ||
              itemName.includes("tomato") ||
              hindiName.includes("टमाटर");
            break;
          case "red-onions":
            matchesCategory =
              itemName.includes("onion") ||
              hindiName.includes("प्याज़") ||
              hindiName.includes("प्याज");
            break;
          case "carrots":
            matchesCategory =
              itemName.includes("carrot") ||
              hindiName.includes("गाजर") ||
              catName.includes("root");
            break;
          case "capsicum":
            matchesCategory =
              itemName.includes("capsicum") ||
              itemName.includes("pepper") ||
              hindiName.includes("शिमला");
            break;
          case "potatoes":
            matchesCategory =
              itemName.includes("potato") ||
              hindiName.includes("आलू");
            break;
          case "salads-herbs":
            matchesCategory =
              catName.includes("salad") ||
              catName.includes("herb") ||
              itemName.includes("cucumber") ||
              itemName.includes("coriander") ||
              itemName.includes("mint") ||
              itemName.includes("kheera");
            break;
          case "gourds-specials":
            matchesCategory =
              catName.includes("gourd") ||
              itemName.includes("gourd") ||
              itemName.includes("brinjal") ||
              itemName.includes("lauki") ||
              hindiName.includes("बैंगन") ||
              hindiName.includes("लौकी");
            break;
          default: {
            const itemCatId = catName.replace(/[^a-z0-9]/g, "-");
            matchesCategory = itemCatId === activeCategory || catName.includes(activeCategory);
            break;
          }
        }
      }

      // 2. Search Query Matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.hindiName && item.hindiName.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, activeCategory]);

  const handleScrollToShop = () => {
    const el = document.getElementById("products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigateSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
  };

  return (
    <div className="app-root kheti-page-root">
      {/* 1. Header with logo, nav, search, QR scanner button, cart */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigateSection={handleNavigateSection}
      />

      {/* 2. Hero Banner (DB driven settings & promotions) */}
      <HeroBanner onShopClick={handleScrollToShop} />

      {/* 3. 5-Point Trust Badges Strip directly under hero */}
      <FeatureBadgesBar />

      {/* 4. Shop by Category with circular photos */}
      <CategoryExplore
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onScrollToProducts={handleScrollToShop}
      />

      {/* 5. Fresh Picks for You (Best Sellers carousel & DB products) */}
      <FreshPicksSection
        products={filteredProducts}
        isLoading={isLoading}
        error={error}
        onRetry={refreshProducts}
        onResetSearch={handleResetSearch}
        onViewAll={handleResetSearch}
      />

      {/* 6. Supporting Local Farmers mid-page story banner */}
      <FarmBannerSection onLearnMoreClick={handleScrollToShop} />

      {/* 7. Why Choose KhetiSe? */}
      <WhyChooseSection />

      {/* 8. Footer */}
      <Footer />

      {/* 9. Interactive Drawers and Modals */}
      <CartDrawer />
      <CheckoutModal />
      <ShareQRModal />
      <FloatingWhatsApp />
      <MobileStickyCart />

      {/* 10. Global Toast Notification */}
      {toastMessage && (
        <div className="toast-container" role="status" aria-live="polite">
          <CheckCircle2 size={18} style={{ color: "var(--primary-400)" }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
