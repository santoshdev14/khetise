import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tags, CheckCircle2, X, RefreshCw } from "lucide-react";
import { adminService } from "../services/adminService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("active");
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } catch (err) {
      showToastMsg("Error loading categories: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryStatus(cat.status || "active");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          status: categoryStatus
        });
        showToastMsg(`✓ Category "${categoryName}" updated!`);
      } else {
        await adminService.createCategory({
          name: categoryName.trim(),
          status: categoryStatus
        });
        showToastMsg(`✓ Category "${categoryName}" created!`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await adminService.deleteCategory(cat.id);
      showToastMsg(`Category deleted`);
      fetchCategories();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
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
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Vegetable Categories</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
            Categories automatically create filter pills on the customer store.
          </p>
        </div>

        <button type="button" onClick={openAddModal} className="btn-admin-primary">
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              <RefreshCw size={24} className="spin-icon" style={{ margin: "0 auto 0.75rem" }} />
              <div>Loading categories...</div>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Category Name</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: "#64748b" }}>#{c.id}</td>
                      <td style={{ fontWeight: 700, color: "#0f172a" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Tags size={16} color="#15803d" />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${c.status || "active"}`}>
                          {c.status || "active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="btn-action-icon btn-action-edit"
                            title="Edit Category"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="btn-action-icon btn-action-delete"
                            title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    <span>Category Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leafy Greens, Root Vegetables..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Status</span>
                  </label>
                  <select
                    value={categoryStatus}
                    onChange={(e) => setCategoryStatus(e.target.value)}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-admin-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary">
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
