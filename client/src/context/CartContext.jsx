import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { siteConfig } from "../config/siteConfig";
import { useProducts } from "./ProductsContext";
import { useSettings } from "./SettingsContext";
import { productService } from "../services/productService";

const CartContext = createContext();

const CART_STORAGE_KEY = "kheti_se_cart_v1";
const CUSTOMER_STORAGE_KEY = "kheti_se_customer_v1";

export function CartProvider({ children }) {
  const { products } = useProducts();
  const {
    storeName,
    whatsappNumber: dynamicWhatsAppNumber,
    freeDeliveryThreshold: dynamicFreeThreshold,
    deliveryFee: dynamicDeliveryFee,
    minOrderAmount: dynamicMinOrderAmount
  } = useSettings();


  // Load initial cart from localStorage
  const [rawCart, setRawCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load cart from storage", e);
      return [];
    }
  });

  // Load saved customer info
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            name: "",
            mobile: "",
            address: "",
            landmark: "",
            instructions: ""
          };
    } catch (e) {
      return {
        name: "",
        mobile: "",
        address: "",
        landmark: "",
        instructions: ""
      };
    }
  });

  // UI Drawer & Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rawCart));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [rawCart]);

  // Sync customer info to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerInfo));
    } catch (e) {
      console.error("Failed to persist customer info", e);
    }
  }, [customerInfo]);

  // Synchronize cart with latest product catalog from database (Price, unit, name updates)
  const cart = useMemo(() => {
    return rawCart.map((item) => {
      const latestProduct = products.find((p) => String(p.id) === String(item.product.id));
      if (latestProduct) {
        return {
          ...item,
          product: {
            ...item.product,
            ...latestProduct
          }
        };
      }
      return item;
    });
  }, [rawCart, products]);

  // Toast trigger helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2500);
  };

  // Add or increment item
  const addToCart = (product, quantity = 1) => {
    setRawCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => String(item.product.id) === String(product.id));
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product: { ...updated[existingIndex].product, ...product }
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity: quantity || product.minQty || 1 }];
      }
    });
    showToast(`Added ${product.name} to basket`);
  };

  // Set specific quantity (or remove if 0)
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setRawCart((prevCart) =>
      prevCart.map((item) =>
        String(item.product.id) === String(productId) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item
  const removeFromCart = (productId) => {
    setRawCart((prevCart) => {
      const itemToRemove = prevCart.find((item) => String(item.product.id) === String(productId));
      if (itemToRemove) {
        showToast(`Removed ${itemToRemove.product.name} from basket`);
      }
      return prevCart.filter((item) => String(item.product.id) !== String(productId));
    });
  };

  // Clear cart
  const clearCart = () => {
    setRawCart([]);
  };

  // Query quantity for product card stepper
  const getItemQuantity = (productId) => {
    const item = cart.find((i) => String(i.product.id) === String(productId));
    return item ? item.quantity : 0;
  };

  // Total quantity count
  const totalItemsCount = cart.reduce((sum, item) => sum + 1, 0);

  // Subtotal calculation (Uses live database prices)
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Delivery calculation from live settings or fallback
  const freeThreshold = dynamicFreeThreshold;
  const standardFee = dynamicDeliveryFee;

  const isFreeDelivery = cartSubtotal >= freeThreshold;
  const deliveryFee = cartSubtotal === 0 ? 0 : isFreeDelivery ? 0 : standardFee;
  const freeDeliveryRemaining = Math.max(0, freeThreshold - cartSubtotal);

  const orderTotal = cartSubtotal + deliveryFee;

  // Active WhatsApp Number (from live settings)
  const activeWhatsAppNumber = dynamicWhatsAppNumber;

  // Generate WhatsApp Order Link (with proper UTF-8 encoding for emojis via official API)
  const generateWhatsAppUrl = (orderId = null) => {
    const cleanNumber = String(activeWhatsAppNumber || "").replace(/[^0-9]/g, "");
    const lines = [];
    lines.push(`*${storeName || "Kheti Se"} - New Order${orderId ? ` (#${orderId})` : ""}* 🌿`);
    lines.push(``);
    lines.push(`*Customer Details:*`);
    lines.push(`👤 *Name:* ${customerInfo.name.trim() || "Valued Customer"}`);
    lines.push(`📱 *Mobile:* ${customerInfo.mobile.trim() || "Not provided"}`);
    lines.push(`📍 *Address:* ${customerInfo.address.trim() || "Not provided"}`);
    if (customerInfo.landmark?.trim()) {
      lines.push(`📍 *Landmark:* ${customerInfo.landmark.trim()}`);
    }
    if (customerInfo.instructions?.trim()) {
      lines.push(`📝 *Note:* ${customerInfo.instructions.trim()}`);
    }
    lines.push(``);
    lines.push(`*Order Summary:*`);
    
    cart.forEach((item, index) => {
      const itemTotal = item.product.price * item.quantity;
      lines.push(`${index + 1}. *${item.product.name}* (${item.quantity} ${item.product.unit}) - Rs. ${itemTotal}`);
    });

    lines.push(``);
    lines.push(`*Item Subtotal:* Rs. ${cartSubtotal}`);
    if (deliveryFee > 0) {
      lines.push(`*Delivery Charge:* Rs. ${deliveryFee}`);
    } else {
      lines.push(`*Delivery Charge:* FREE 🎉`);
    }
    lines.push(`*Total Amount: Rs. ${orderTotal}*`);
    lines.push(``);
    lines.push(`Thank you for shopping with ${storeName || "Kheti Se"}! 🙏`);

    const fullMessage = lines.join("\n");
    const encodedMessage = encodeURIComponent(fullMessage);
    // Use official api.whatsapp.com endpoint to preserve UTF-8 emoji bytes across WhatsApp Web & Mobile
    return `https://api.whatsapp.com/send/?phone=${cleanNumber}&text=${encodedMessage}`;
  };

  const getOrderSummaryText = () => {
    const lines = [];
    lines.push(`${storeName || "Kheti Se"} - New Order`);
    lines.push(`Customer Name: ${customerInfo.name || "Customer"}`);
    lines.push(`Mobile: ${customerInfo.mobile || ""}`);
    lines.push(`Address: ${customerInfo.address || ""}`);
    if (customerInfo.landmark) lines.push(`Landmark: ${customerInfo.landmark}`);
    if (customerInfo.instructions) lines.push(`Instructions: ${customerInfo.instructions}`);
    lines.push(``);
    lines.push(`Order:`);
    cart.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.product.name} - ${item.quantity} ${item.product.unit} - Rs. ${item.product.price * item.quantity}`);
    });
    lines.push(`Subtotal: Rs. ${cartSubtotal}`);
    lines.push(`Delivery: ${deliveryFee === 0 ? "FREE" : "Rs. " + deliveryFee}`);
    lines.push(`Total: Rs. ${orderTotal}`);
    lines.push(``);
    lines.push(`Thank you for shopping with ${storeName || "Kheti Se"}! 🙏`);
    return lines.join("\n");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItemsCount,
        cartSubtotal,
        deliveryFee,
        isFreeDelivery,
        freeDeliveryRemaining,
        orderTotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isQRModalOpen,
        setIsQRModalOpen,
        customerInfo,
        setCustomerInfo,
        generateWhatsAppUrl,
        getOrderSummaryText,
        toastMessage,
        showToast,
        activeWhatsAppNumber
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
