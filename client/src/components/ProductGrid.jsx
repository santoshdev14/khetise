import React from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { SearchX, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function ProductGrid({
  products,
  isLoading,
  error,
  onRetry,
  onResetSearch
}) {
  // 1. Loading State with Skeletons
  if (isLoading) {
    return (
      <div className="product-loading-container">
        <div className="loading-indicator-badge">
          <RefreshCw size={16} className="spin-icon" />
          <span>Loading fresh vegetables from farm...</span>
        </div>
        <ProductSkeleton count={8} />
      </div>
    );
  }

  // 2. Error State with friendly message & retry button
  if (error && products.length === 0) {
    return (
      <div className="product-error-container">
        <div className="error-icon-box">
          <AlertCircle size={36} />
        </div>
        <h3 className="error-title">We're having trouble loading today's vegetables</h3>
        <p className="error-subtitle">
          Please check your internet connection or try again in a moment.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="btn-retry-fetch"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // 3. Empty Search Results
  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3.5rem 1rem" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            color: "#64748b"
          }}
        >
          <SearchX size={32} />
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.4rem" }}>
          No vegetables found
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "1.25rem" }}>
          We couldn't find any vegetable matching your current selection.
        </p>
        <button
          type="button"
          onClick={onResetSearch}
          className="btn-continue-shopping"
          style={{ display: "inline-flex", width: "auto", padding: "0.65rem 1.5rem" }}
        >
          View All Vegetables
        </button>
      </div>
    );
  }

  // 4. Render Product Cards
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
