import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function MobileStickyCart() {
  const { cart, totalItemsCount, orderTotal, setIsCartOpen } = useCart();

  if (cart.length === 0) return null;

  return (
    <div className="mobile-sticky-cart-bar">
      <div className="mobile-cart-info">
        <span className="mobile-cart-items-count">
          {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"} in Basket
        </span>
        <span className="mobile-cart-total">₹{orderTotal}</span>
      </div>

      <button
        type="button"
        className="btn-mobile-view-cart"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingBag size={18} />
        <span>View Basket</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
