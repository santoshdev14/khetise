import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerStore from "./CustomerStore";
import AdminLogin from "./admin/AdminLogin";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ProductManagement from "./admin/ProductManagement";
import CategoryManagement from "./admin/CategoryManagement";
import OrderManagement from "./admin/OrderManagement";
import AdminSettings from "./admin/AdminSettings";
import BannerManagement from "./admin/BannerManagement";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ProductsProvider } from "./context/ProductsContext";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <SettingsProvider>
          <ProductsProvider>
            <CartProvider>
              <Routes>
                {/* Customer Facing Website */}
                <Route path="/" element={<CustomerStore />} />

                {/* Admin Login */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Dashboard & Management Routes */}
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="banners" element={<BannerManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </ProductsProvider>
        </SettingsProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
