import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Ban } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getImageUrl, FALLBACK_IMAGE } from "../utils/imageHelper";

export default function ProductCard({ product }) {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const [imageError, setImageError] = useState(false);

  const isAvailable = product.status
    ? product.status.toLowerCase().trim() === "active"
    : product.available !== false;
  const currentQty = getItemQuantity(product.id);

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const step = product.step || 1;
    if (currentQty === 0) {
      addToCart(product, product.minQty || 1);
    } else {
      updateQuantity(product.id, currentQty + step);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    const step = product.step || 1;
    const nextQty = Math.max(0, currentQty - step);
    updateQuantity(product.id, nextQty);
  };

  // Determine discount percentage and original price
  const price = parseFloat(product.price) || 0;
  // Calculate discount percentage based on ID or custom logic to provide realistic discounts like reference
  const discountPercentages = [20, 15, 10, 25, 12, 18];
  const discountPercent = product.discount
    ? parseInt(product.discount, 10)
    : discountPercentages[(product.id || 1) % discountPercentages.length];
  const originalPrice = Math.round(price / (1 - discountPercent / 100));

  const displayImage = !imageError && product.image ? getImageUrl(product.image) : FALLBACK_IMAGE;

  return (
    <div className={`ref-product-card ${!isAvailable ? "card-unavailable" : ""}`}>
      {/* Product Image Container with Floating Overlay Badge */}
      <div className="ref-image-container">
        {isAvailable && discountPercent > 0 ? (
          <span className="ref-discount-badge">{discountPercent}% OFF</span>
        ) : !isAvailable ? (
          <span className="ref-discount-badge ref-badge-oos">Out of Stock</span>
        ) : null}

        <img
          src={displayImage}
          alt={product.name}
          className="ref-product-image"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Product Information */}
      <div className="ref-product-info">
        <h3 className="ref-product-title" title={product.name}>
          {product.name}
        </h3>
        {product.hindiName && (
          <span className="ref-product-hindi">{product.hindiName}</span>
        )}

        {/* Pricing & Weight Row */}
        <div className="ref-pricing-row">
          <div className="ref-price-group">
            <span className="ref-current-price">₹{price}</span>
            {originalPrice > price && (
              <span className="ref-original-price">₹{originalPrice}</span>
            )}
          </div>
          <span className="ref-unit-tag">{product.unit || "1 kg"}</span>
        </div>

        {/* Add to Cart or Stepper */}
        <div className="ref-action-box">
          {!isAvailable ? (
            <button type="button" className="ref-btn-disabled" disabled>
              <Ban size={14} />
              <span>Out of Stock</span>
            </button>
          ) : currentQty === 0 ? (
            <button
              type="button"
              className="ref-add-to-cart-btn"
              onClick={handleIncrement}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={15} />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="ref-quantity-stepper">
              <button
                type="button"
                className="ref-stepper-btn"
                onClick={handleDecrement}
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="ref-stepper-text">
                {currentQty} {product.unit || "kg"}
              </span>
              <button
                type="button"
                className="ref-stepper-btn"
                onClick={handleIncrement}
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
