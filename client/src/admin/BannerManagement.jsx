import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  ArrowRight,
  Sliders,
  ExternalLink
} from "lucide-react";
import { adminService } from "../services/adminService";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteConfirmBanner, setDeleteConfirmBanner] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    highlight_text: "",
    subtitle: "",
    badge_text: "100% Fresh & Organic",
    discount_badge: "UP TO 40% OFF ON SELECTED VEGETABLES",
    primary_cta_text: "Shop Fresh Vegetables",
    primary_cta_action: "shop",
    secondary_cta_text: "Direct Inquiry",
    secondary_cta_link: "whatsapp",
    sort_order: 1,
    is_active: true,
    image_url: ""
  });

  const [imageMode, setImageMode] = useState("url"); // "url" | "upload"
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const fileInputRef = useRef(null);

  const showToastMsg = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      showToastMsg("Error loading banners: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      highlight_text: "",
      subtitle: "",
      badge_text: "100% Fresh & Organic",
      discount_badge: "UP TO 40% OFF ON SELECTED VEGETABLES",
      primary_cta_text: "Shop Fresh Vegetables",
      primary_cta_action: "shop",
      secondary_cta_text: "Direct Inquiry",
      secondary_cta_link: "whatsapp",
      sort_order: banners.length + 1,
      is_active: true,
      image_url: ""
    });
    setSelectedFile(null);
    setFilePreview("");
    setImageMode("url");
  };

  const openAddModal = () => {
    setEditingBanner(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      highlight_text: banner.highlightText || "",
      subtitle: banner.subtitle || "",
      badge_text: banner.badgeText || "100% Fresh & Organic",
      discount_badge: banner.discountBadge || "UP TO 40% OFF ON SELECTED VEGETABLES",
      primary_cta_text: banner.primaryCtaText || "Shop Fresh Vegetables",
      primary_cta_action: banner.primaryCtaAction || "shop",
      secondary_cta_text: banner.secondaryCtaText || "Direct Inquiry",
      secondary_cta_link: banner.secondaryCtaLink || "whatsapp",
      sort_order: banner.sortOrder || 1,
      is_active: banner.isActive !== false,
      image_url: banner.imageUrl || ""
    });
    setSelectedFile(null);
    setFilePreview(banner.imageUrl || "");
    setImageMode(banner.imageUrl?.startsWith("/uploads/") ? "upload" : "url");
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        showToastMsg("File size must be under 12MB", "error");
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append("imageFile", selectedFile);
        payload.append("title", formData.title);
        payload.append("highlight_text", formData.highlight_text);
        payload.append("subtitle", formData.subtitle);
        payload.append("badge_text", formData.badge_text);
        payload.append("discount_badge", formData.discount_badge);
        payload.append("primary_cta_text", formData.primary_cta_text);
        payload.append("primary_cta_action", formData.primary_cta_action);
        payload.append("secondary_cta_text", formData.secondary_cta_text);
        payload.append("secondary_cta_link", formData.secondary_cta_link);
        payload.append("sort_order", formData.sort_order);
        payload.append("is_active", formData.is_active);
      } else {
        payload = {
          ...formData,
          image_url: formData.image_url || filePreview
        };
      }

      if (editingBanner) {
        await adminService.updateBanner(editingBanner.id, payload);
        showToastMsg(`✓ Banner #${editingBanner.id} updated successfully!`);
      } else {
        await adminService.createBanner(payload);
        showToastMsg("✓ New Hero Banner created successfully!");
      }

      // Notify customer view to re-render in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kheti_banners_updated"));
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      showToastMsg("Save failed: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    const nextStatus = !banner.isActive;
    try {
      await adminService.toggleBannerStatus(banner.id, nextStatus);
      showToastMsg(`Banner #${banner.id} is now ${nextStatus ? "Active" : "Inactive"}`);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextStatus } : b))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kheti_banners_updated"));
      }
    } catch (err) {
      showToastMsg("Status update failed: " + err.message, "error");
    }
  };

  const handleDelete = (banner) => {
    setDeleteConfirmBanner(banner);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmBanner) return;
    setIsDeleting(true);
    try {
      await adminService.deleteBanner(deleteConfirmBanner.id);
      showToastMsg(`Banner #${deleteConfirmBanner.id} deleted successfully!`);
      setBanners((prev) => prev.filter((b) => b.id !== deleteConfirmBanner.id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kheti_banners_updated"));
      }
      setDeleteConfirmBanner(null);
    } catch (err) {
      showToastMsg("Delete failed: " + err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;
  const currentPreviewImage =
    selectedFile && filePreview
      ? filePreview
      : formData.image_url ||
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85";

  return (
    <div className="admin-page-container">
      {/* Toast Notification */}
      {toast && (
        <div
          className="toast-container"
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: toast.type === "error" ? "#ef4444" : "#166534",
            color: "#ffffff",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            fontWeight: 600,
            fontSize: "0.92rem"
          }}
        >
          {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              <Sliders size={26} style={{ color: "#16a34a" }} />
              Hero Banner Management
            </h1>
            <p className="admin-page-subtitle">
              Manage the dynamic hero banner slides displayed on your storefront. Customize badges, headlines, discount offers, and images.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={fetchBanners}
              className="btn-admin-secondary"
              title="Refresh banners"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="btn-admin-primary"
            >
              <Plus size={18} />
              <span>Add New Banner</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <div className="stat-pill" style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#64748b" }}>Total Banners:</span>
            <strong style={{ color: "#0f172a" }}>{banners.length}</strong>
          </div>
          <div className="stat-pill" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#166534" }}>Active on Storefront:</span>
            <strong style={{ color: "#16a34a" }}>{activeCount}</strong>
          </div>
          <div className="stat-pill" style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "#991b1b" }}>Inactive:</span>
            <strong style={{ color: "#dc2626" }}>{banners.length - activeCount}</strong>
          </div>
        </div>
      </div>

      {/* Banner Cards Grid */}
      {isLoading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: "0 auto 1rem", color: "#16a34a" }} />
          <p>Loading hero banners from database...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="admin-card" style={{ padding: "3rem", textAlign: "center" }}>
          <ImageIcon size={48} style={{ color: "#cbd5e1", margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>No Hero Banners Found</h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Create your first hero banner slide to showcase your fresh farm produce on the home page.</p>
          <button type="button" onClick={openAddModal} className="btn-admin-primary">
            <Plus size={18} />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="banner-card-grid">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="admin-card"
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: banner.isActive ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                opacity: banner.isActive ? 1 : 0.8,
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Banner Visual Preview Header */}
              <div
                style={{
                  height: "180px",
                  position: "relative",
                  backgroundImage: `url(${banner.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1rem"
                }}
              >
                {/* Dark Gradient Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%)",
                    zIndex: 1
                  }}
                />

                {/* Top Row: Pill Badge + Sort Order */}
                <div className="banner-card-header-top">
                  <span className="banner-pill-badge" title={banner.badgeText || "100% Fresh & Organic"}>
                    {banner.badgeText || "100% Fresh & Organic"}
                  </span>
                  <span className="banner-order-tag">
                    Order #{banner.sortOrder}
                  </span>
                </div>

                {/* Bottom Overlay Info inside Image */}
                <div style={{ position: "relative", zIndex: 2 }}>
                  {banner.discountBadge && (
                    <span
                      style={{
                        display: "inline-block",
                        background: "rgba(255, 255, 255, 0.95)",
                        color: "#166534",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "8px",
                        marginBottom: "0.35rem"
                      }}
                    >
                      {banner.discountBadge}
                    </span>
                  )}
                  <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 800, margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                    {banner.title}{" "}
                    <span style={{ color: "#4ade80" }}>{banner.highlightText}</span>
                  </h4>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "1.25rem", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                    {banner.subtitle || "No subtitle provided."}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div style={{ background: "#f1f5f9", padding: "0.35rem 0.65rem", borderRadius: "6px", fontSize: "0.78rem", color: "#334155" }}>
                      <strong>CTA:</strong> {banner.primaryCtaText}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.35rem 0.65rem",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        background: banner.isActive ? "#dcfce7" : "#fee2e2",
                        color: banner.isActive ? "#166534" : "#991b1b"
                      }}
                    >
                      {banner.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{banner.isActive ? "Active (Visible)" : "Inactive (Hidden)"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="banner-card-footer">
                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(banner)}
                    className={`banner-btn-toggle ${banner.isActive ? "btn-hide" : "btn-show"}`}
                    title={banner.isActive ? "Hide this slide from storefront" : "Make slide visible on storefront"}
                  >
                    {banner.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{banner.isActive ? "Hide" : "Show"}</span>
                  </button>

                  <div className="banner-footer-actions">
                    <button
                      type="button"
                      onClick={() => openEditModal(banner)}
                      className="banner-btn-edit"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(banner)}
                      className="banner-btn-delete"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: "720px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={20} style={{ color: "#16a34a" }} />
                <span>{editingBanner ? `Edit Hero Banner #${editingBanner.id}` : "Add New Hero Banner"}</span>
              </h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto", padding: "1.5rem" }}>
                
                {/* Live Preview Card inside Modal */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label" style={{ fontWeight: 700, color: "#1e293b", marginBottom: "0.4rem" }}>
                    Live Preview Preview
                  </label>
                  <div
                    style={{
                      height: "180px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      position: "relative",
                      backgroundImage: `url(${currentPreviewImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "1.25rem",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)", zIndex: 1 }} />
                    <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ background: "rgba(22, 163, 74, 0.9)", color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "20px" }}>
                        {formData.badge_text || "100% Fresh & Organic"}
                      </span>
                      {formData.discount_badge && (
                        <span style={{ background: "rgba(255, 255, 255, 0.95)", color: "#166534", fontSize: "0.72rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "8px" }}>
                          {formData.discount_badge}
                        </span>
                      )}
                    </div>
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 800, margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                        {formData.title || "Nature's Goodness"}{" "}
                        <span style={{ color: "#4ade80" }}>{formData.highlight_text || "Straight to Your Plate"}</span>
                      </h3>
                      <p style={{ color: "#e2e8f0", fontSize: "0.82rem", margin: "0.3rem 0 0.6rem", maxWidth: "90%", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                        {formData.subtitle || "Fresh, chemical-free vegetables handpicked from local farms."}
                      </p>
                      <button
                        type="button"
                        style={{
                          background: "#16a34a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "20px",
                          padding: "0.35rem 0.85rem",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <span>{formData.primary_cta_text || "Shop Fresh Vegetables"}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner Image Source Selection */}
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                      Banner Background Image <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
                      <button
                        type="button"
                        onClick={() => setImageMode("url")}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: imageMode === "url" ? "#16a34a" : "#ffffff",
                          color: imageMode === "url" ? "#ffffff" : "#475569",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("upload")}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: imageMode === "upload" ? "#16a34a" : "#ffffff",
                          color: imageMode === "upload" ? "#ffffff" : "#475569",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Upload File
                      </button>
                    </div>
                  </div>

                  {imageMode === "upload" ? (
                    <div
                      style={{
                        border: "2px dashed #cbd5e1",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        textAlign: "center",
                        background: "#f8fafc",
                        cursor: "pointer"
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      <UploadCloud size={36} style={{ color: "#16a34a", margin: "0 auto 0.5rem" }} />
                      <p style={{ fontWeight: 600, color: "#1e293b", margin: 0, fontSize: "0.92rem" }}>
                        {selectedFile ? selectedFile.name : "Click or drag image file here to upload"}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
                        PNG, JPG, WEBP up to 12MB (Landscape ~1400x600 recommended)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://images.unsplash.com/photo-1540420773420... or /uploads/..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        required={!selectedFile}
                      />
                      <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.3rem" }}>
                        Paste any high-resolution image URL (Unsplash, CDN, or uploaded image path).
                      </p>
                    </div>
                  )}
                </div>

                {/* Headlines Row */}
                <div className="banner-modal-grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Title Prefix <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Nature's Goodness"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Highlighted Text (Green Accent) <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Straight to Your Plate"
                      value={formData.highlight_text}
                      onChange={(e) => setFormData({ ...formData, highlight_text: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Subtitle / Paragraph Description
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family."
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                {/* Badges Row */}
                <div className="banner-modal-grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Top Organic Badge Pill
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 100% Fresh & Organic"
                      value={formData.badge_text}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Discount Offer Stamp
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. UP TO 40% OFF ON SELECTED VEGETABLES"
                      value={formData.discount_badge}
                      onChange={(e) => setFormData({ ...formData, discount_badge: e.target.value })}
                    />
                  </div>
                </div>

                {/* CTA Row */}
                <div className="banner-modal-grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Shop Fresh Vegetables"
                      value={formData.primary_cta_text}
                      onChange={(e) => setFormData({ ...formData, primary_cta_text: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Button Action
                    </label>
                    <select
                      className="form-select"
                      value={formData.primary_cta_action}
                      onChange={(e) => setFormData({ ...formData, primary_cta_action: e.target.value })}
                    >
                      <option value="shop">Scroll to Shop Produce</option>
                      <option value="category">Category Filter</option>
                      <option value="whatsapp">Direct WhatsApp Inquiry</option>
                    </select>
                  </div>
                </div>

                {/* Order & Active Status Row */}
                <div className="banner-modal-grid-2" style={{ alignItems: "center" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Display Sort Order (1 = First Slide)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      className="form-input"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>

                  <div className="form-group" style={{ paddingTop: "0.25rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginTop: "1rem" }}>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "#16a34a" }}
                      />
                      <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#1e293b" }}>
                        Active (Visible on Customer Site)
                      </span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="banner-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingBanner ? "Save Changes" : "Create Banner"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmBanner && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 1050 }}
          onClick={() => !isDeleting && setDeleteConfirmBanner(null)}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: "440px", width: "92%", textAlign: "center", padding: "2rem 1.75rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem"
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Delete Hero Banner?
            </h3>

            <p style={{ fontSize: "0.92rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Are you sure you want to permanently delete{" "}
              <strong>
                "{deleteConfirmBanner.title} {deleteConfirmBanner.highlightText || ""}"
              </strong>
              ? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
                onClick={() => setDeleteConfirmBanner(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  padding: "0.6rem 1.35rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)"
                }}
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
