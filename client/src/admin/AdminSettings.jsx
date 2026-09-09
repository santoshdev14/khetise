import React, { useState, useEffect } from "react";
import {
  Store,
  MessageSquare,
  PhoneCall,
  Truck,
  Clock,
  MapPin,
  Save,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "../services/adminService";
import { useSettings } from "../context/SettingsContext";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminSettings() {
  const { updateSettingsLocally } = useSettings();
  const { admin, updateAdminProfile } = useAdminAuth();

  // Active Tab: 'store' | 'profile' | 'security'
  const [activeTab, setActiveTab] = useState("store");

  // --- Store Configuration State ---
  const [settings, setSettings] = useState({
    store_name: "Kheti Se",
    tagline: "Seedha Khet Se, Aapke Ghar Tak",
    whatsapp_number: "919876543210",
    phone_number: "+91 98765 43210",
    min_order_amount: "100",
    free_delivery_above: "249",
    delivery_charge: "25",
    timings: "Morning 7:00 AM - Evening 8:30 PM",
    delivery_info: "Same-Day Delivery within 2-4 hours in local area",
    hero_badge: "100% Fresh & Organic",
    hero_title_prefix: "Nature's Goodness",
    hero_title_highlight: "Straight to Your Plate",
    hero_subtitle: "Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family.",
    hero_discount_badge: "UP TO 40% OFF ON SELECTED VEGETABLES",
    hero_cta_text: "Shop Fresh Vegetables",
    hero_image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // --- Admin Profile State ---
  const [profileName, setProfileName] = useState(admin?.name || "Santosh Varma");
  const [profileEmail, setProfileEmail] = useState(admin?.email || "santoshvarma01814@gmail.com");
  const [profileOtp, setProfileOtp] = useState("");
  const [isRequestingProfileOtp, setIsRequestingProfileOtp] = useState(false);
  const [profileOtpSent, setProfileOtpSent] = useState(false);
  const [profileCountdown, setProfileCountdown] = useState(0);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // --- Password Change State ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isRequestingPasswordOtp, setIsRequestingPasswordOtp] = useState(false);
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordCountdown, setPasswordCountdown] = useState(0);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Sync admin profile details when admin context loads
  useEffect(() => {
    if (admin) {
      setProfileName(admin.name || "");
      setProfileEmail(admin.email || "");
    }
  }, [admin]);

  // Cooldown timers for OTP resend
  useEffect(() => {
    let timer;
    if (profileCountdown > 0) {
      timer = setTimeout(() => setProfileCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [profileCountdown]);

  useEffect(() => {
    let timer;
    if (passwordCountdown > 0) {
      timer = setTimeout(() => setPasswordCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [passwordCountdown]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings((prev) => ({ ...prev, ...data }));
        updateSettingsLocally(data);
      }
    } catch (err) {
      showToastMsg("Error loading settings: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // --- Submit Store Settings ---
  const handleSubmitSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateSettings(settings);
      updateSettingsLocally(settings);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kheti_settings_updated"));
      }

      setHasChanges(false);
      showToastMsg("Settings successfully saved and live on store!");
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Profile OTP Request ---
  const handleRequestProfileOtp = async () => {
    if (profileCountdown > 0) return;
    setIsRequestingProfileOtp(true);
    setProfileMsg(null);
    try {
      const res = await adminService.requestOtp("profile_update");
      setProfileOtpSent(true);
      setProfileCountdown(60);
      setProfileMsg({
        type: "success",
        text: res.message || "OTP code sent to your registered email."
      });
      showToastMsg("Verification OTP sent to email!");
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.message || "Failed to send OTP code."
      });
    } finally {
      setIsRequestingProfileOtp(false);
    }
  };

  // --- Submit Profile Update ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileOtp.trim()) {
      setProfileMsg({ type: "error", text: "Please enter the 6-digit OTP code sent to your email." });
      return;
    }
    setIsUpdatingProfile(true);
    setProfileMsg(null);
    try {
      const res = await adminService.updateProfile({
        name: profileName,
        email: profileEmail,
        otp: profileOtp
      });
      if (res?.admin && res?.token) {
        updateAdminProfile(res.admin, res.token);
      }
      setProfileOtp("");
      setProfileOtpSent(false);
      setProfileMsg({ type: "success", text: "Admin profile updated successfully!" });
      showToastMsg("Profile updated successfully!");
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // --- Password OTP Request ---
  const handleRequestPasswordOtp = async () => {
    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Please enter your current password first." });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (passwordCountdown > 0) return;

    setIsRequestingPasswordOtp(true);
    setPasswordMsg(null);
    try {
      const res = await adminService.requestOtp("password_change");
      setPasswordOtpSent(true);
      setPasswordCountdown(60);
      setPasswordMsg({
        type: "success",
        text: res.message || "OTP code sent to your registered email."
      });
      showToastMsg("Verification OTP sent to email!");
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.message || "Failed to send OTP code."
      });
    } finally {
      setIsRequestingPasswordOtp(false);
    }
  };

  // --- Submit Password Change ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Current password is required." });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (!passwordOtp.trim()) {
      setPasswordMsg({ type: "error", text: "Please enter the 6-digit OTP code sent to your email." });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMsg(null);
    try {
      await adminService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        otp: passwordOtp
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
      setPasswordOtpSent(false);
      setPasswordMsg({ type: "success", text: "Admin password changed successfully!" });
      showToastMsg("Password updated successfully!");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "360px", color: "#64748b" }}>
        <RefreshCw size={28} className="spin-icon" style={{ marginBottom: "0.85rem", color: "#16a34a" }} />
        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="settings-page-container">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            background: "#0f4423",
            color: "#ffffff",
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
            fontWeight: 600,
            fontSize: "0.92rem",
            animation: "fadeIn 0.2s ease"
          }}
        >
          <CheckCircle2 size={19} style={{ color: "#4ade80" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="settings-header-banner">
        <div className="settings-header-title-group">
          <h2>Admin & Store Configuration</h2>
          <p>
            Manage store details, order routing, admin profile (username), and password security with email OTP.
          </p>
        </div>

        <div className="settings-header-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-settings-visit"
            title="Open customer website in new tab"
          >
            <Store size={16} />
            <span>Visit Live Store</span>
            <ExternalLink size={13} style={{ color: "#94a3b8" }} />
          </a>
        </div>
      </div>

      {/* Responsive Segmented Tab Navigation */}
      <div className="settings-tab-nav">
        <button
          type="button"
          onClick={() => setActiveTab("store")}
          className={`settings-tab-btn ${activeTab === "store" ? "active" : ""}`}
        >
          <Store size={17} />
          <span>Store Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
        >
          <User size={17} />
          <span>Admin Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
        >
          <ShieldCheck size={17} />
          <span>Change Password</span>
        </button>
      </div>

      {/* TAB 1: STORE CONFIGURATION */}
      {activeTab === "store" && (
        <form onSubmit={handleSubmitSettings}>
          {/* Card 1: Store Brand Identity */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title-row">
                <div className="settings-card-icon-badge green">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="settings-card-title">Store Identity</h3>
                  <p className="settings-card-subtitle">Public business branding and storefront titles</p>
                </div>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="settings-grid-2">
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Store Name</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kheti Se"
                      value={settings.store_name}
                      onChange={(e) => handleChange("store_name", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Shown on header logo, browser title tab, and receipts.
                  </span>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Tagline / Slogan</span>
                  </label>
                  <div className="settings-input-container">
                    <input
                      type="text"
                      placeholder="e.g. Seedha Khet Se, Aapke Ghar Tak"
                      value={settings.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Appears below store logo and in footer branding.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: WhatsApp & Support Contact */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title-row">
                <div className="settings-card-icon-badge green">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="settings-card-title">WhatsApp Orders & Contact Info</h3>
                  <p className="settings-card-subtitle">Where customer orders and inquiries are sent</p>
                </div>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="settings-grid-2">
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>WhatsApp Business Number</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon whatsapp-addon">
                      <span>+</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="919876543210 (Country code + digits)"
                      value={settings.whatsapp_number}
                      onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint success">
                    ✓ All WhatsApp 1-click orders from customers are routed to this number.
                  </span>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Customer Support Phone (Display Only)</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <PhoneCall size={15} />
                    </div>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={settings.phone_number}
                      onChange={(e) => handleChange("phone_number", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Displayed in footer for customers who wish to call.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Delivery Fees & Thresholds */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title-row">
                <div className="settings-card-icon-badge blue">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="settings-card-title">Delivery Fees & Free Thresholds</h3>
                  <p className="settings-card-subtitle">Automated checkout calculations for customers</p>
                </div>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="settings-grid-3">
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Delivery Fee</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon rupee-addon">
                      <span>₹</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="25"
                      value={settings.delivery_charge}
                      onChange={(e) => handleChange("delivery_charge", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Standard delivery charge for normal orders.
                  </span>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Free Delivery Above</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon rupee-addon">
                      <span>₹</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="249"
                      value={settings.free_delivery_above}
                      onChange={(e) => handleChange("free_delivery_above", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Basket subtotal to unlock 100% free delivery.
                  </span>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Min Order Amount</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon rupee-addon">
                      <span>₹</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="100"
                      value={settings.min_order_amount}
                      onChange={(e) => handleChange("min_order_amount", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Recommended minimum order value.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Operating Timings & Delivery Info */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title-row">
                <div className="settings-card-icon-badge amber">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="settings-card-title">Timings & Delivery Coverage</h3>
                  <p className="settings-card-subtitle">Operating schedule and area info displayed to customers</p>
                </div>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="settings-grid-2">
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Operating Hours</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <Clock size={15} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Morning 7:00 AM - Evening 8:30 PM"
                      value={settings.timings}
                      onChange={(e) => handleChange("timings", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Displayed in footer hours and customer checkout notice.
                  </span>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Delivery Zone Info</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <MapPin size={15} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Same-Day Delivery within 2-4 hours in local area"
                      value={settings.delivery_info}
                      onChange={(e) => handleChange("delivery_info", e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Coverage information shown in footer and badges.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Bottom Action Bar */}
          <div className="settings-bottom-actions">
            <div className="settings-status-info">
              <span className="settings-status-dot" />
              <span>{hasChanges ? "You have unsaved changes" : "All settings saved and live in database"}</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-settings-save"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={17} className="spin-icon" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={17} />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ADMIN PROFILE & USERNAME */}
      {activeTab === "profile" && (
        <form onSubmit={handleUpdateProfile}>
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title-row">
                <div className="settings-card-icon-badge green">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="settings-card-title">Admin Profile (Username & Email)</h3>
                  <p className="settings-card-subtitle">
                    Changes require 6-digit confirmation code sent to your email (<code>santoshvarma01814@gmail.com</code>)
                  </p>
                </div>
              </div>
            </div>

            <div className="settings-card-body">
              {profileMsg && (
                <div className={`settings-alert-msg ${profileMsg.type}`}>
                  {profileMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="settings-grid-2">
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Admin Name / Username</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Santosh Varma"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Displayed in the admin dashboard header and welcome greeting.
                  </span>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Registered Admin Email</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="santoshvarma01814@gmail.com"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                  <span className="settings-hint">
                    Used for security alerts, OTP verification codes, and password resets.
                  </span>
                </div>
              </div>

              {/* OTP Verification Box */}
              <div className="settings-otp-box">
                <div className="settings-otp-header">
                  <div className="settings-otp-title-group">
                    <h4>Email OTP Verification</h4>
                    <p>
                      Click "Send OTP" to receive a 6-digit confirmation code on <code>{profileEmail || "your email"}</code>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestProfileOtp}
                    disabled={isRequestingProfileOtp || profileCountdown > 0}
                    className="btn-send-otp"
                  >
                    {isRequestingProfileOtp ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" />
                        <span>Sending...</span>
                      </>
                    ) : profileCountdown > 0 ? (
                      <>
                        <Clock size={14} />
                        <span>Resend in {profileCountdown}s</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{profileOtpSent ? "Resend OTP" : "Send OTP via Email"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="settings-field-group settings-otp-input-group" style={{ maxWidth: "260px" }}>
                  <label className="settings-label">
                    <span>Enter 6-Digit OTP</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={profileOtp}
                      onChange={(e) => setProfileOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="settings-input-field"
                      style={{ letterSpacing: "2px", fontWeight: 700, fontSize: "1.05rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="settings-action-btn-row" style={{ marginTop: "1.75rem", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isUpdatingProfile || !profileOtp}
                  className="btn-settings-save"
                >
                  {isUpdatingProfile ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Verifying & Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      <span>Confirm & Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: CHANGE PASSWORD */}
      {activeTab === "security" && (
        <form onSubmit={handleChangePassword}>
          <div className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title-row">
                <div className="settings-card-icon-badge blue">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="settings-card-title">Change Admin Password</h3>
                  <p className="settings-card-subtitle">
                    Enter your current password, new password, and verify via Email OTP sent to <code>{admin?.email || "santoshvarma01814@gmail.com"}</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="settings-card-body">
              {passwordMsg && (
                <div className={`settings-alert-msg ${passwordMsg.type}`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div className="settings-grid-3">
                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Current Password</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="settings-input-field"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0.5rem", color: "#64748b" }}
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>New Password</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="settings-input-field"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0.5rem", color: "#64748b" }}
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="settings-field-group">
                  <label className="settings-label">
                    <span>Confirm New Password</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="settings-input-field"
                    />
                  </div>
                </div>
              </div>

              {/* OTP Verification Box */}
              <div className="settings-otp-box">
                <div className="settings-otp-header">
                  <div className="settings-otp-title-group">
                    <h4>Security Verification Code</h4>
                    <p>
                      Send verification OTP to <code>{admin?.email || "santoshvarma01814@gmail.com"}</code> to authorize this password change.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestPasswordOtp}
                    disabled={isRequestingPasswordOtp || passwordCountdown > 0}
                    className="btn-send-otp"
                  >
                    {isRequestingPasswordOtp ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" />
                        <span>Sending...</span>
                      </>
                    ) : passwordCountdown > 0 ? (
                      <>
                        <Clock size={14} />
                        <span>Resend in {passwordCountdown}s</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{passwordOtpSent ? "Resend OTP" : "Send OTP via Email"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="settings-field-group settings-otp-input-group" style={{ maxWidth: "260px" }}>
                  <label className="settings-label">
                    <span>Enter 6-Digit OTP</span>
                    <span className="settings-label-required">*</span>
                  </label>
                  <div className="settings-input-container">
                    <div className="settings-input-addon">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={passwordOtp}
                      onChange={(e) => setPasswordOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="settings-input-field"
                      style={{ letterSpacing: "2px", fontWeight: 700, fontSize: "1.05rem" }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="settings-action-btn-row" style={{ marginTop: "1.75rem", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !passwordOtp || !currentPassword || !newPassword}
                  className="btn-settings-save"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Verifying & Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      <span>Confirm & Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
