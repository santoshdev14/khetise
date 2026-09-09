import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { siteConfig } from "../config/siteConfig";
import { productService } from "../services/productService";

const SettingsContext = createContext();

const SETTINGS_STORAGE_KEY = "kheti_se_live_settings_v1";

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }
    return {
      store_name: siteConfig.storeName,
      tagline: siteConfig.tagline,
      whatsapp_number: siteConfig.whatsappNumber,
      phone_number: siteConfig.whatsappDisplayNumber,
      min_order_amount: String(siteConfig.delivery.minimumOrderAmount),
      free_delivery_above: String(siteConfig.delivery.freeDeliveryThreshold),
      delivery_charge: String(siteConfig.delivery.standardDeliveryFee),
      timings: siteConfig.timings,
      delivery_info: siteConfig.delivery.serviceAreas
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productService.fetchSettings();
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        setSettings((prev) => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (error) {
      console.warn("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();

    // Listen to custom event dispatched on settings save
    const handleSettingsUpdated = () => {
      loadSettings();
    };

    window.addEventListener("kheti_settings_updated", handleSettingsUpdated);
    return () => {
      window.removeEventListener("kheti_settings_updated", handleSettingsUpdated);
    };
  }, [loadSettings]);

  // Dynamically update document browser title
  useEffect(() => {
    const titleName = settings.store_name || siteConfig.storeName;
    const titleTagline = settings.tagline || siteConfig.tagline;
    if (typeof document !== "undefined" && titleName) {
      document.title = `${titleName} — ${titleTagline}`;
    }
  }, [settings.store_name, settings.tagline]);

  // Derived convenient helper getters
  const storeName = settings.store_name || siteConfig.storeName;
  const tagline = settings.tagline || siteConfig.tagline;
  const whatsappNumber = settings.whatsapp_number || siteConfig.whatsappNumber;
  const phoneNumber = settings.phone_number || siteConfig.whatsappDisplayNumber;
  const minOrderAmount = parseFloat(settings.min_order_amount) || siteConfig.delivery.minimumOrderAmount;
  const freeDeliveryThreshold = parseFloat(settings.free_delivery_above) || siteConfig.delivery.freeDeliveryThreshold;
  const deliveryFee = parseFloat(settings.delivery_charge) || siteConfig.delivery.standardDeliveryFee;
  const timings = settings.timings || siteConfig.timings;
  const deliveryInfo = settings.delivery_info || siteConfig.delivery.serviceAreas;

  // Hero banner settings from DB
  const heroBadge = settings.hero_badge || "100% Fresh & Organic";
  const heroTitlePrefix = settings.hero_title_prefix || "Nature's Goodness";
  const heroTitleHighlight = settings.hero_title_highlight || "Straight to Your Plate";
  const heroSubtitle = settings.hero_subtitle || "Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family.";
  const heroDiscountBadge = settings.hero_discount_badge || "UP TO 40% OFF ON SELECTED VEGETABLES";
  const heroCtaText = settings.hero_cta_text || "Shop Fresh Vegetables";
  const heroImageUrl = settings.hero_image_url || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85";

  const updateSettingsLocally = (newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        storeName,
        tagline,
        whatsappNumber,
        phoneNumber,
        minOrderAmount,
        freeDeliveryThreshold,
        deliveryFee,
        timings,
        deliveryInfo,
        heroBadge,
        heroTitlePrefix,
        heroTitleHighlight,
        heroSubtitle,
        heroDiscountBadge,
        heroCtaText,
        heroImageUrl,
        isLoading,
        refreshSettings: loadSettings,
        updateSettingsLocally
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
