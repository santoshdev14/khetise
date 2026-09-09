import { apiRequest } from "./api";
import { PRODUCTS as DEFAULT_FALLBACK_PRODUCTS } from "../data/products";

const CACHE_KEY = "kheti_se_api_products_v2";
const CACHE_TIME_KEY = "kheti_se_api_time_v2";

export const productService = {
  /**
   * Fetch all products from Backend REST API
   */
  async fetchProducts(forceRefresh = false) {
    try {
      const data = await apiRequest("/api/products");
      if (Array.isArray(data)) {
        const normalized = data.map((p, idx) => {
          const statusLower = String(p.status || "active").toLowerCase().trim();
          const isAvail = statusLower === "active";
          return {
            ...p,
            id: String(p.id),
            status: statusLower,
            available: isAvail,
            minQty: 1,
            step: 1,
            sort_order: p.sort_order || idx + 1
          };
        });

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
          localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (storageErr) {
          // ignore
        }

        return {
          products: normalized,
          source: "backend_api",
          lastUpdated: new Date()
        };
      }
      throw new Error("Invalid response format from product API");
    } catch (error) {
      console.warn("Backend API fetch failed, trying local fallback:", error);

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return {
              products: parsed,
              source: "stale_cache",
              lastUpdated: new Date()
            };
          }
        }
      } catch (e) {
        // ignore
      }

      // Final default fallback
      const fallbackList = DEFAULT_FALLBACK_PRODUCTS.map((p, idx) => ({
        ...p,
        id: String(p.id),
        available: true,
        sort_order: idx + 1
      }));

      return {
        products: fallbackList,
        source: "fallback",
        error: error.message,
        lastUpdated: new Date()
      };
    }
  },

  /**
   * Submit an order to the backend database
   */
  async placeOrder(orderData) {
    return apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData)
    });
  },

  /**
   * Fetch live store settings (WhatsApp number, delivery thresholds)
   */
  async fetchSettings() {
    try {
      return await apiRequest("/api/settings");
    } catch (error) {
      console.warn("Failed to fetch settings from backend:", error);
      return null;
    }
  }
};
