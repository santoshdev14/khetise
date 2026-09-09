import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  RefreshCw,
  MessageSquare,
  X,
  FileText
} from "lucide-react";
import { adminService } from "../services/adminService";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getOrders({
        search: searchQuery,
        status: statusFilter,
        sort: sortOrder
      });
      setOrders(data);
    } catch (err) {
      showToastMsg("Error loading orders: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      showToastMsg(`Order #${orderId} marked as ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      fetchOrders();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const getWhatsAppCustomerLink = (order) => {
    const msg = encodeURIComponent(
      `Namaste ${order.customer_name}! 🌾\nThis is regarding your Kheti Se order #${order.id} (Total: ₹${order.total_amount}).\nStatus: *${order.status}*\nThank you for choosing farm fresh produce!`
    );
    const cleanMobile = order.mobile.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanMobile.startsWith("91") ? cleanMobile : `91${cleanMobile}`}?text=${msg}`;
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="toast-container" style={{ bottom: "2rem" }}>
          <CheckCircle2 size={18} style={{ color: "#4ade80" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <form onSubmit={handleSearchSubmit} className="admin-search-box">
            <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by Order ID, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="admin-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="btn-admin-secondary"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders Table Card */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <RefreshCw size={24} className="spin-icon" style={{ margin: "0 auto 0.75rem" }} />
              <div>Loading orders...</div>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              No orders found matching your search.
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer Details</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 800, color: "#15803d" }}>#{ord.id}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{ord.customer_name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{ord.mobile}</div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8", maxWidth: "200px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {ord.address}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                          {ord.items?.length || 0} {ord.items?.length === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
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
                      <td style={{ fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="btn-admin-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: "580px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Order #{selectedOrder.id}</h3>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Customer Info Card */}
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1.1rem", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "0.92rem", fontWeight: 800, marginBottom: "0.6rem", color: "#0f172a" }}>
                  Customer Information
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.88rem" }}>
                  <div>
                    <strong>Name:</strong> {selectedOrder.customer_name}
                  </div>
                  <div>
                    <strong>Mobile:</strong> {selectedOrder.mobile}
                  </div>
                  <div>
                    <strong>Address:</strong> {selectedOrder.address}
                  </div>
                  {selectedOrder.landmark && (
                    <div>
                      <strong>Landmark:</strong> {selectedOrder.landmark}
                    </div>
                  )}
                  {selectedOrder.instructions && (
                    <div style={{ color: "#b45309" }}>
                      <strong>Note:</strong> {selectedOrder.instructions}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "0.85rem" }}>
                  <a
                    href={getWhatsAppCustomerLink(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-modal-whatsapp-btn"
                  >
                    <MessageSquare size={16} />
                    <span>Chat with Customer on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.6rem", color: "#0f172a" }}>
                  Ordered Vegetables ({selectedOrder.items?.length || 0})
                </h4>
                <div className="admin-modal-table-container">
                  <table style={{ width: "100%", minWidth: "320px", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    <thead style={{ background: "#f1f5f9" }}>
                      <tr>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "left" }}>Item</th>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>Qty</th>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Price</th>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.6rem 0.8rem", fontWeight: 700 }}>{item.product_name}</td>
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>
                            {item.quantity} {item.unit}
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>₹{item.price}</td>
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "right", fontWeight: 800 }}>
                            ₹{item.subtotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0.5rem 0", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Item Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Delivery Charge</span>
                  <span>{selectedOrder.delivery_fee > 0 ? `₹${selectedOrder.delivery_fee}` : "FREE"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", borderTop: "1px dashed #cbd5e1", paddingTop: "0.5rem" }}>
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              {/* Status Updater */}
              <div className="form-group" style={{ marginTop: "0.5rem" }}>
                <label className="form-label">
                  <span>Update Order Status</span>
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-admin-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
