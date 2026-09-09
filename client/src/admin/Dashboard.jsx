import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  IndianRupee,
  Package,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Eye
} from "lucide-react";
import { adminService } from "../services/adminService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
        <RefreshCw size={28} className="spin-icon" style={{ margin: "0 auto 1rem" }} />
        <p>Loading Dashboard Analytics...</p>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todaySales: 0,
    totalProducts: 0,
    outOfStock: 0
  };

  const metricCards = [
    {
      label: "Total Orders",
      value: metrics.todayOrders,
      icon: <ShoppingCart size={22} color="#15803d" />,
      bg: "#dcfce7"
    },
    {
      label: "Pending Orders",
      value: metrics.pendingOrders,
      icon: <Clock size={22} color="#b45309" />,
      bg: "#fef3c7"
    },
    {
      label: "Completed Orders",
      value: metrics.completedOrders,
      icon: <CheckCircle2 size={22} color="#0369a1" />,
      bg: "#e0f2fe"
    },
    {
      label: "Total Sales",
      value: `₹${metrics.todaySales}`,
      icon: <IndianRupee size={22} color="#15803d" />,
      bg: "#dcfce7"
    },
    {
      label: "Total Products",
      value: metrics.totalProducts,
      icon: <Package size={22} color="#4338ca" />,
      bg: "#e0e7ff"
    },
    {
      label: "Out of Stock",
      value: metrics.outOfStock,
      icon: <AlertTriangle size={22} color="#b91c1c" />,
      bg: "#fee2e2"
    }
  ];

  return (
    <div>
      {/* Top Banner & Quick Action */}
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
            Welcome back, Store Admin 👋
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
            Here is what's happening in Kheti Se store today.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="btn-admin-secondary"
            title="Refresh Stats"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <Link to="/admin/products" className="btn-admin-primary">
            <Plus size={16} />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="metrics-grid">
        {metricCards.map((m, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-icon-box" style={{ background: m.bg }}>
              {m.icon}
            </div>
            <div className="metric-info">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        {/* Recent Orders Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShoppingCart size={19} color="#15803d" />
              <h3 className="admin-card-title">Recent Customer Orders</h3>
            </div>
            <Link to="/admin/orders" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-card-body" style={{ padding: 0 }}>
            {stats?.recentOrders?.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                No orders received yet.
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontWeight: 700 }}>#{ord.id}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{ord.customer_name}</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{ord.mobile}</div>
                        </td>
                        <td style={{ fontWeight: 800, color: "#0f172a" }}>
                          ₹{ord.total_amount}
                        </td>
                        <td>
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`status-badge status-${ord.status.toLowerCase().replace(/\s+/g, "-")}`}
                            style={{ border: "none", cursor: "pointer", outline: "none" }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stock Alert / Low Stock Items */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertTriangle size={19} color="#dc2626" />
              <h3 className="admin-card-title">Inventory & Stock Alerts</h3>
            </div>
            <Link to="/admin/products" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>Manage All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="admin-card-body" style={{ padding: "1rem" }}>
            {stats?.outOfStockItems?.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#15803d", fontWeight: 600 }}>
                ✓ All vegetables are in stock and active!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stats?.outOfStockItems?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{item.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        ₹{item.price} / {item.unit}
                      </div>
                    </div>

                    <span className={`status-badge status-${item.status.toLowerCase().replace(/\s+/g, "_")}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
