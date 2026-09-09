import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  Upload,
  RefreshCw,
  Ban,
  ArrowUpDown
} from "lucide-react";
import { adminService } from "../services/adminService";
import { getImageUrl, handleImageError, FALLBACK_IMAGE } from "../utils/imageHelper";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add mode, object = Edit mode
  const [formData, setFormData] = useState({
    name: "",
    hindi_name: "",
    price: "",
    unit: "Kg",
    category_name: "Daily Essentials",
    image_url: "",
    description: "",
    status: "active",
    sort_order: 1
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProductsAndCategories = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminService.getProducts({
          search: searchQuery,
          category: categoryFilter,
          status: statusFilter
        }),
        adminService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error("Error loading products:", err);
      showToastMsg("Failed to load products: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProductsAndCategories();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      hindi_name: "",
      price: "",
      unit: "Kg",
      category_name: categories[0]?.name || "Daily Essentials",
      image_url: "",
      description: "",
      status: "active",
      sort_order: products.length + 1
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      hindi_name: product.hindi_name || "",
      price: product.price,
      unit: product.unit,
      category_name: product.category_name || "Daily Essentials",
      image_url: product.image_url || "",
      description: product.description || "",
      status: product.status || "active",
      sort_order: product.sort_order || 1
    });
    setSelectedFile(null);
    setPreviewUrl(product.image_url || "");
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("hindi_name", formData.hindi_name);
      data.append("price", formData.price);
      data.append("unit", formData.unit);
      data.append("category_name", formData.category_name);
      data.append("image_url", formData.image_url);
      data.append("description", formData.description);
      data.append("status", formData.status);
      data.append("sort_order", formData.sort_order);

      if (selectedFile) {
        data.append("imageFile", selectedFile);
      }

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, data);
        showToastMsg(`✓ "${formData.name}" updated successfully!`);
      } else {
        await adminService.createProduct(data);
        showToastMsg(`✓ "${formData.name}" added to catalog!`);
      }

      setIsModalOpen(false);
      fetchProductsAndCategories();
    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusToggle = async (product, newStatus) => {
    try {
      await adminService.updateProductStatus(product.id, newStatus);
      showToastMsg(`Marked ${product.name} as ${newStatus.replace("_", " ")}`);
      fetchProductsAndCategories();
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      return;
    }
    try {
      await adminService.deleteProduct(product.id);
      showToastMsg(`Deleted ${product.name}`);
      fetchProductsAndCategories();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container" style={{ bottom: "2rem" }}>
          <CheckCircle2 size={18} style={{ color: "#4ade80" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <form onSubmit={handleSearchSubmit} className="admin-search-box">
            <Search size={18} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by vegetable name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="inactive">Inactive / Hidden</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-admin-primary"
        >
          <Plus size={18} />
          <span>Add New Vegetable</span>
        </button>
      </div>

      {/* Products Table Card */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <RefreshCw size={24} className="spin-icon" style={{ margin: "0 auto 0.75rem" }} />
              <div>Loading vegetables...</div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
              No vegetables found matching your filters.
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Vegetable Name</th>
                    <th>Price / Unit</th>
                    <th>Category</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      {/* Photo */}
                      <td>
                        <img
                          src={getImageUrl(p.image_url)}
                          alt={p.name}
                          className="admin-prod-thumb"
                          onError={handleImageError}
                        />
                      </td>

                      {/* Name */}
                      <td>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{p.name}</div>
                        {p.hindi_name && (
                          <div style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 600 }}>
                            {p.hindi_name}
                          </div>
                        )}
                      </td>

                      {/* Price & Unit */}
                      <td>
                        <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                          ₹{p.price}
                        </span>{" "}
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>/ {p.unit}</span>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ background: "#f1f5f9", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.82rem", fontWeight: 600 }}>
                          {p.category_name || "Daily Essentials"}
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td style={{ fontWeight: 700, color: "#64748b" }}>
                        #{p.sort_order || 1}
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <select
                          value={p.status}
                          onChange={(e) => handleQuickStatusToggle(p, e.target.value)}
                          className={`status-badge status-${p.status}`}
                          style={{ border: "none", cursor: "pointer", outline: "none" }}
                        >
                          <option value="active">Active (Selling)</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="inactive">Inactive (Hidden)</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="btn-action-icon btn-action-edit"
                            title="Edit Product Details & Price"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="btn-action-icon btn-action-delete"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? `Edit Vegetable: ${editingProduct.name}` : "Add New Farm Vegetable"}
              </h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* Image Upload Area */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Vegetable Photo</span>
                  </label>

                  {previewUrl && (
                    <div className="image-preview-box">
                      <img src={getImageUrl(previewUrl)} alt="Preview" className="image-preview-img" onError={handleImageError} />
                    </div>
                  )}

                  <label className="image-upload-dropzone">
                    <Upload size={24} style={{ margin: "0 auto 0.4rem", color: "#15803d" }} />
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>
                      Click to upload vegetable image
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Supports JPG, PNG, WEBP (Max 5MB)
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>

                  {/* Or external image URL */}
                  <div style={{ marginTop: "0.6rem" }}>
                    <input
                      type="text"
                      placeholder="Or paste image URL (e.g. Unsplash URL or image path)..."
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        if (!selectedFile) setPreviewUrl(e.target.value);
                      }}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Product Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fresh Tomato"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* Hindi Name */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Hindi Name (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. देसी टमाटर (Tamatar)"
                      value={formData.hindi_name}
                      onChange={(e) => setFormData({ ...formData, hindi_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-grid-3">
                  {/* Price */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Price (₹) *</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="40"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* Unit */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Unit *</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="form-input"
                    >
                      <option value="Kg">Kg</option>
                      <option value="500g">500g</option>
                      <option value="250g">250g</option>
                      <option value="Bunch">Bunch</option>
                      <option value="Pc">Pc</option>
                      <option value="4 Pcs">4 Pcs</option>
                    </select>
                  </div>

                  {/* Display Order */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Sort Order</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Category</span>
                    </label>
                    <select
                      value={formData.category_name}
                      onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                      className="form-input"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Stock Status</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-input"
                    >
                      <option value="active">Active (Available for order)</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="inactive">Inactive (Hidden from customer site)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Short Description</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Crisp, farm-picked fresh daily..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-admin-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-admin-primary"
                >
                  {isSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
