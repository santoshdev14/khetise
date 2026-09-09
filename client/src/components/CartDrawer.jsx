import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquareCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    deliveryFee,
    orderTotal,
    isFreeDelivery,
    freeDeliveryRemaining
  } = useCart();
  const { freeDeliveryThreshold } = useSettings();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const progressPercent = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside className="drawer-panel" aria-label="Shopping Cart">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={22} className="text-primary" />
            <h2 className="drawer-title">Your Basket</h2>
            <span className="drawer-count-badge">{cart.length} items</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {cart.length > 0 && (
          <div className="drawer-free-delivery-bar">
            {isFreeDelivery ? (
              <span style={{ fontWeight: 700, color: "var(--primary-700)" }}>
                🎉 Congratulations! You have unlocked FREE Delivery!
              </span>
            ) : (
              <span>
                Add <strong>₹{freeDeliveryRemaining}</strong> more for <strong>FREE Delivery</strong>
              </span>
            )}
            <div className="free-delivery-progress">
              <div
                className="free-delivery-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Body / Item List */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">
                <ShoppingBag size={40} />
              </div>
              <h3 className="empty-cart-title">Your basket is empty</h3>
              <p className="empty-cart-sub">
                Explore our fresh harvest and add daily farm vegetables to your basket.
              </p>
              <button
                type="button"
                className="btn-checkout-whatsapp"
                style={{ background: "var(--primary-700)" }}
                onClick={() => setIsCartOpen(false)}
              >
                <span>Browse Fresh Vegetables</span>
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.price * item.quantity;
              return (
                <div key={item.product.id} className="cart-item-card">
                  <img
                    src={getImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="cart-item-img"
                    onError={handleImageError}
                  />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.product.name}</h4>
                    <p className="cart-item-rate">
                      ₹{item.product.price} / {item.product.unit}
                    </p>
                    <div className="cart-item-stepper">
                      <button
                        type="button"
                        className="cart-stepper-btn"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - (item.product.step || 1)
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="cart-stepper-qty">
                        {item.quantity} {item.product.unit}
                      </span>
                      <button
                        type="button"
                        className="cart-stepper-btn"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + (item.product.step || 1)
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                    <span className="cart-item-total">₹{itemTotal}</span>
                    <button
                      type="button"
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(item.product.id)}
                      title="Remove vegetable"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Totals & Actions */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary-row">
              <span>Item Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="cart-summary-row total-row">
              <span>Total Amount</span>
              <span>₹{orderTotal}</span>
            </div>

            <div className="cart-actions-group">
              <button
                type="button"
                className="btn-checkout-whatsapp"
                onClick={handleProceedToCheckout}
              >
                <MessageSquareCheck size={20} />
                <span>Order on WhatsApp</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="btn-continue-shopping"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
