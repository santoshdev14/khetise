import React from "react";
import { Search, X } from "lucide-react";

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories = []
}) {
  return (
    <div className="catalog-controls">
      {/* Live Search Input */}
      <div className="search-bar-wrapper">
        <Search size={19} className="search-icon-left" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vegetables (e.g., Tomato, Potato, Spinach, Gajar)..."
          className="search-input"
          aria-label="Search fresh vegetables"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchQuery("")}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dynamic Category Pills */}
      {categories.length > 1 && (
        <div className="category-scroll-container">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${isActive ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
