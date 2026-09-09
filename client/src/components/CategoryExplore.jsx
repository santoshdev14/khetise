import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { handleImageError } from "../utils/imageHelper";

export default function CategoryExplore({ activeCategory, onSelectCategory, onScrollToProducts }) {
  // Curated category items with imagery matching the design
  const categoryList = [
    {
      id: "leafy-greens",
      name: "Leafy Greens",
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=260&auto=format&fit=crop&q=80",
      alt: "Fresh Green Leafy Spinach"
    },
    {
      id: "daily-essentials",
      name: "Tomatoes",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=260&auto=format&fit=crop&q=80",
      alt: "Juicy Red Tomatoes"
    },
    {
      id: "red-onions",
      name: "Onions",
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=260&auto=format&fit=crop&q=80",
      alt: "Fresh Red Onions"
    },
    {
      id: "carrots",
      name: "Carrots",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=260&auto=format&fit=crop&q=80",
      alt: "Crunchy Orange Carrots"
    },
    {
      id: "capsicum",
      name: "Capsicum",
      image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=260&auto=format&fit=crop&q=80",
      alt: "Crisp Green Capsicum"
    },
    {
      id: "potatoes",
      name: "Potatoes",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=260&auto=format&fit=crop&q=80",
      alt: "Farm Fresh Potatoes"
    },
    {
      id: "salads-herbs",
      name: "Salads & Herbs",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=260&auto=format&fit=crop&q=80",
      alt: "Fresh Salads & Herbs"
    },
    {
      id: "gourds-specials",
      name: "Gourds & Brinjal",
      image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=260&auto=format&fit=crop&q=80",
      alt: "Glossy Purple Brinjal"
    }
  ];

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId);
    if (onScrollToProducts) {
      onScrollToProducts();
    }
  };

  return (
    <section className="category-explore-section">
      <div className="container">
        {/* Section Header */}
        <div className="category-section-top">
          <div className="category-header-left">
            <span className="category-eyebrow">— SHOP BY CATEGORY</span>
            <h2 className="category-main-title">
              Explore Our <span className="title-green">Fresh Vegetables</span>
            </h2>
            <p className="category-main-subtitle">
              From leafy greens to juicy tomatoes, everything you need for a healthy life.
            </p>
          </div>

          <button
            type="button"
            className="view-all-link-btn"
            onClick={() => handleCategoryClick("all")}
          >
            <span>View All Categories</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Categories Row / Grid */}
        <div className="category-cards-scroll">
          {categoryList.map((item) => {
            const isSelected = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`category-card-pill ${isSelected ? "active" : ""}`}
                onClick={() => handleCategoryClick(item.id)}
                aria-label={`Filter by ${item.name}`}
              >
                <div className="category-img-wrapper">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="category-circle-img"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>
                <div className="category-label-row">
                  <span className="category-card-name">{item.name}</span>
                  <ChevronRight size={14} className="category-arrow" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
