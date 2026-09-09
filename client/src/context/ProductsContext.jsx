import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { productService } from "../services/productService";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadProducts = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productService.fetchProducts(force);
      setProducts(result.products || []);
      setSource(result.source || "unknown");
      setLastUpdated(result.lastUpdated || new Date());
      if (result.error && result.source === "fallback_error") {
        setError(result.error);
      }
    } catch (err) {
      console.error("ProductsProvider load error:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(false);

    const handleUpdate = () => {
      loadProducts(true);
    };

    window.addEventListener("kheti_products_updated", handleUpdate);
    return () => {
      window.removeEventListener("kheti_products_updated", handleUpdate);
    };
  }, [loadProducts]);

  // Derived: Available products (available === true)
  const availableProducts = useMemo(() => {
    return products.filter((p) => p.available !== false);
  }, [products]);

  // Derived: Dynamic categories list extracted from products
  const categories = useMemo(() => {
    const defaultList = [{ id: "all", label: "All Sabziyaan", icon: "🥬" }];
    
    // Category icon helper
    const getCategoryIcon = (name) => {
      const lower = name.toLowerCase();
      if (lower.includes("leaf") || lower.includes("green") || lower.includes("palak")) return "🌱";
      if (lower.includes("root") || lower.includes("potato") || lower.includes("carrot")) return "🥔";
      if (lower.includes("salad") || lower.includes("herb") || lower.includes("dhaniya")) return "🥗";
      if (lower.includes("gourd") || lower.includes("lauki") || lower.includes("kheera")) return "🥒";
      if (lower.includes("daily") || lower.includes("essential")) return "🥕";
      return "🥦";
    };

    const uniqueCategories = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((cat) => Boolean(cat && cat.trim()))
      )
    );

    const dynamicItems = uniqueCategories.map((cat) => ({
      id: cat.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      label: cat,
      icon: getCategoryIcon(cat),
      originalName: cat
    }));

    return [...defaultList, ...dynamicItems];
  }, [products]);

  const refreshProducts = () => loadProducts(true);

  return (
    <ProductsContext.Provider
      value={{
        products,
        availableProducts,
        categories,
        isLoading,
        error,
        source,
        lastUpdated,
        refreshProducts
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
