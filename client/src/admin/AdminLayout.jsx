import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Sprout,
  ShieldCheck,
  Sliders
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import "../styles/admin.css";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "Dashboard Overview";
    if (path.startsWith("/admin/products")) return "Product Management";
    if (path.startsWith("/admin/categories")) return "Category Management";
    if (path.startsWith("/admin/banners")) return "Hero Banners";
    if (path.startsWith("/admin/orders")) return "Orders & Deliveries";
    if (path.startsWith("/admin/settings")) return "Store Settings";
    return "Admin Portal";
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={19} />, end: true },
    { to: "/admin/products", label: "Products", icon: <Package size={19} /> },
    { to: "/admin/categories", label: "Categories", icon: <Tags size={19} /> },
    { to: "/admin/banners", label: "Hero Banners", icon: <Sliders size={19} /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingCart size={19} /> },
    { to: "/admin/settings", label: "Settings", icon: <Settings size={19} /> }
  ];

  return (
    <div className="admin-layout-root">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Sprout size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="sidebar-brand-title">Kheti Se</span>
              <span className="sidebar-brand-badge">Admin</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Store Manager</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="sidebar-footer">
          <div className="sidebar-user-box">
            <div className="sidebar-user-avatar">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{admin?.name || "Administrator"}</span>
              <span className="sidebar-user-email">{admin?.email || "admin@khetise.com"}</span>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sidebar-action btn-sidebar-store"
          >
            <Store size={16} />
            <span>Open Customer Store</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-sidebar-action btn-sidebar-logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="admin-db-status-badge" title="Database Connected">
              <ShieldCheck size={16} />
              <span><span className="badge-long-text">Database </span>Connected</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
