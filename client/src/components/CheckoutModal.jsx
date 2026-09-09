import React, { useState } from "react";
import { X, MessageSquare, Check, Copy, AlertCircle, Sparkles, MapPin, Phone, User, FileText } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import confetti from "canvas-confetti";
import { siteConfig } from "../config/siteConfig";
import { productService } from "../services/productService";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    customerInfo,
    setCustomerInfo,
    generateWhatsAppUrl,
    cartSubtotal,
    deliveryFee,
    orderTotal,
    showToast
  } = useCart();
  const { storeName } = useSettings();

  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const validateForm = () => {
    const errs = {};
    if (!customerInfo.name || !customerInfo.name.trim()) {
      errs.name = "Please enter your name";
    }
    if (!customerInfo.mobile || customerInfo.mobile.trim().length < 10) {
      errs.mobile = "Please enter a valid 10-digit mobile number";
    }
    if (!customerInfo.address || !customerInfo.address.trim()) {
      errs.address = "Please enter your delivery address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // 1. Record order in PostgreSQL / Database
    let orderId = null;
    try {
      const orderPayload = {
        customer_name: customerInfo.name.trim(),
        mobile: customerInfo.mobile.trim(),
        address: customerInfo.address.trim(),
        landmark: (customerInfo.landmark || "").trim(),
        instructions: (customerInfo.instructions || "").trim(),
        subtotal: cartSubtotal,
        delivery_fee: deliveryFee,
        total_amount: orderTotal,
        items: cart.map((item) => ({
          product_id: item.product.id ? parseInt(item.product.id, 10) || null : null,
          product_name: item.product.name,
          quantity: item.quantity,
          unit: item.product.unit,
          price: item.product.price,
          subtotal: item.product.price * item.quantity
        }))
      };

      const result = await productService.placeOrder(orderPayload);
      if (result?.orderId) {
        orderId = result.orderId;
      }
    } catch (err) {
      console.warn("Backend order creation non-fatal error:", err);
    }

    // 2. Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    // 3. Open WhatsApp with formatted message
    const waUrl = generateWhatsAppUrl(orderId);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    showToast(orderId ? `Order #${orderId} created! Opening WhatsApp...` : "Opening WhatsApp with your order summary...");
    setIsSubmitting(false);
  };

  const handleCopyOrder = () => {
    const textLines = [];
    textLines.push(`${storeName || "Kheti Se"} - New Order`);
    textLines.push(``);
    textLines.push(`Customer Details:`);
    textLines.push(`- Name: ${customerInfo.name || "Customer"}`);
    textLines.push(`- Mobile: ${customerInfo.mobile || ""}`);
    textLines.push(`- Address: ${customerInfo.address || ""}`);
    if (customerInfo.landmark) textLines.push(`- Landmark: ${customerInfo.landmark}`);
    if (customerInfo.instructions) textLines.push(`- Note: ${customerInfo.instructions}`);
    textLines.push(``);
    textLines.push(`Order Summary:`);
    cart.forEach((item, index) => {
      textLines.push(`${index + 1}. ${item.product.name} (${item.quantity} ${item.product.unit}) - Rs. ${item.product.price * item.quantity}`);
    });
    textLines.push(``);
    textLines.push(`Item Subtotal: Rs. ${cartSubtotal}`);
    textLines.push(`Delivery: ${deliveryFee === 0 ? "FREE" : "Rs. " + deliveryFee}`);
    textLines.push(`Total: Rs. ${orderTotal}`);
    textLines.push(``);
    textLines.push(`Please confirm my order.`);

    navigator.clipboard.writeText(textLines.join("\n")).then(() => {
      setCopied(true);
      showToast("Order text copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-700)"
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="modal-title">
                Delivery Details
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="modal-body">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-name">
              <span>
                <User size={14} style={{ display: "inline", marginRight: "4px" }} />
                Full Name <span className="required-star">*</span>
              </span>
            </label>
            <input
              id="cust-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={customerInfo.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="form-input"
              autoFocus
            />
            {errors.name && (
              <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-mobile">
              <span>
                <Phone size={14} style={{ display: "inline", marginRight: "4px" }} />
                Mobile Number (WhatsApp) <span className="required-star">*</span>
              </span>
            </label>
            <input
              id="cust-mobile"
              type="tel"
              placeholder="e.g. 9876543210"
              value={customerInfo.mobile}
              onChange={(e) => handleFieldChange("mobile", e.target.value)}
              className="form-input"
            />
            {errors.mobile && (
              <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>
                {errors.mobile}
              </span>
            )}
          </div>

          {/* Delivery Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-address">
              <span>
                <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
                Delivery Address <span className="required-star">*</span>
              </span>
            </label>
            <textarea
              id="cust-address"
              placeholder="House / Flat No, Building, Street, Area..."
              value={customerInfo.address}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              className="form-textarea"
              rows={2}
            />
            {errors.address && (
              <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>
                {errors.address}
              </span>
            )}
          </div>

          {/* Landmark */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-landmark">
              <span>Landmark</span>
              <span className="optional-tag">(Optional)</span>
            </label>
            <input
              id="cust-landmark"
              type="text"
              placeholder="e.g. Near Temple / Opposite Park"
              value={customerInfo.landmark || ""}
              onChange={(e) => handleFieldChange("landmark", e.target.value)}
              className="form-input"
            />
          </div>

          {/* Delivery Instructions */}
          <div className="form-group">
            <label className="form-label" htmlFor="cust-instructions">
              <span>
                <FileText size={14} style={{ display: "inline", marginRight: "4px" }} />
                Delivery Instructions
              </span>
              <span className="optional-tag">(Optional)</span>
            </label>
            <input
              id="cust-instructions"
              type="text"
              placeholder="e.g. Ring bell, deliver before 1 PM"
              value={customerInfo.instructions || ""}
              onChange={(e) => handleFieldChange("instructions", e.target.value)}
              className="form-input"
            />
          </div>

          {/* Live Order Summary Box */}
          <div className="order-summary-box">
            <div className="order-summary-title">
              <span>Order Summary</span>
              <span style={{ color: "var(--primary-700)", fontSize: "0.85rem" }}>
                {cart.length} items
              </span>
            </div>

            <div className="order-items-preview">
              {cart.map((item) => (
                <div key={item.product.id} className="preview-item-row">
                  <span>
                    {item.product.name} ({item.quantity} {item.product.unit})
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-summary-total">
              <span>Total Payable</span>
              <span>₹{orderTotal}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            disabled={isSubmitting}
            className="btn-checkout-whatsapp"
            onClick={handleConfirmOrder}
          >
            <MessageSquare size={20} />
            <span>{isSubmitting ? "Creating Order..." : "Confirm Order on WhatsApp"}</span>
          </button>

          <button
            type="button"
            className="btn-continue-shopping"
            onClick={handleCopyOrder}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Order Details Copied!" : "Copy Order Text Fallback"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
