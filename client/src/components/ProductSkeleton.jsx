import React from "react";

export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="product-card skeleton-card" aria-hidden="true">
          {/* Skeleton Image */}
          <div className="product-image-box skeleton-box skeleton-shimmer" />

          {/* Skeleton Details */}
          <div className="product-details">
            <div className="skeleton-line skeleton-title-line skeleton-shimmer" />
            <div className="skeleton-line skeleton-sub-line skeleton-shimmer" />
            <div className="skeleton-line skeleton-desc-line skeleton-shimmer" />

            <div className="product-bottom-row" style={{ marginTop: "1rem" }}>
              <div className="skeleton-line skeleton-price-line skeleton-shimmer" />
              <div className="skeleton-box skeleton-btn-box skeleton-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
