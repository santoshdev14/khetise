import React, { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { SearchX, RefreshCw } from "lucide-react";

export default function FreshPicksSection({
  products,
  isLoading,
  error,
  onRetry,
  onResetSearch,
  onViewAll
}) {
  const scrollContainerRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.85;
      const targetScroll =
        direction === "left"
          ? Math.max(0, scrollLeft - scrollAmount)
          : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }
  };

  const scrollToDot = (dotIndex) => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const targetScroll = (dotIndex / 3) * maxScroll;
        scrollContainerRef.current.scrollTo({
          left: targetScroll,
          behavior: "smooth"
        });
        setActiveDot(dotIndex);
      }
    }
  };

  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 10) {
        const progress = Math.min(1, Math.max(0, scrollLeft / maxScroll));
        const dotIndex = Math.min(3, Math.round(progress * 3));
        setActiveDot(dotIndex);
      } else {
        setActiveDot(0);
      }
    }
  };

  return (
    <section id="products-section" className="fresh-picks-section">
      <div className="container">
        {/* Section Header matching reference */}
        <div className="fresh-picks-header">
          <div className="fresh-picks-header-left">
            <span className="picks-eyebrow">— BEST SELLERS</span>
            <h2 className="picks-main-title">Fresh Picks for You</h2>
            <p className="picks-main-subtitle">Handpicked. Farm-fresh. Always the best.</p>
          </div>

          <button
            type="button"
            className="view-all-link-btn"
            onClick={onViewAll || onResetSearch}
          >
            <span>View All Products</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="product-loading-container">
            <ProductSkeleton count={6} />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && products.length === 0 && (
          <div className="product-error-container">
            <h3 className="error-title">Unable to fetch products from database</h3>
            <p className="error-subtitle">Please ensure the backend is connected.</p>
            <button type="button" onClick={onRetry} className="btn-retry-fetch">
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="empty-products-box">
            <div className="empty-icon-circle">
              <SearchX size={32} />
            </div>
            <h3>No vegetables found</h3>
            <p>Try searching for a different vegetable or reset the category filter.</p>
            <button type="button" onClick={onResetSearch} className="ref-add-to-cart-btn" style={{ maxWidth: "220px", margin: "1rem auto 0" }}>
              <span>Show All Vegetables</span>
            </button>
          </div>
        )}

        {/* Products Carousel / Grid with Left & Right arrows */}
        {!isLoading && products.length > 0 && (
          <div className="picks-carousel-wrapper">
            {/* Left Nav Arrow */}
            <button
              type="button"
              className="picks-nav-btn picks-prev-btn"
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="picks-scroll-container"
              onScroll={handleScrollEvent}
            >
              {products.map((product) => (
                <div key={product.id} className="picks-carousel-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Right Nav Arrow */}
            <button
              type="button"
              className="picks-nav-btn picks-next-btn"
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>

            {/* Pagination Dots below */}
            <div className="picks-pagination-dots">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  type="button"
                  className={`picks-dot ${activeDot === dot ? "active" : ""}`}
                  onClick={() => scrollToDot(dot)}
                  aria-label={`Go to slide ${dot + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
