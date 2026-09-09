import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Sprout,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  Send,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminService } from "../services/adminService";
import "../styles/admin.css";

export default function AdminLogin() {
  const [isForgotMode, setIsForgotMode] = useState(false);

  // --- Login State (Empty defaults without hardcoded demo credentials) ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Forgot Password State ---
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);

  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Cooldown countdown for forgot password OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // If already logged in, redirect to admin dashboard
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Handle Standard Admin Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Request OTP
  const handleRequestForgotOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: "error", text: "Please enter your registered admin email address." });
      return;
    }
    if (countdown > 0) return;

    setIsSendingOtp(true);
    setForgotMsg(null);
    try {
      const res = await adminService.requestForgotPasswordOtp(forgotEmail.trim());
      setOtpSent(true);
      setCountdown(60);
      setForgotMsg({
        type: "success",
        text: res.message || "Reset OTP code sent to your registered Gmail."
      });
    } catch (err) {
      setForgotMsg({
        type: "error",
        text: err.message || "Failed to send reset code. Please check your email."
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Submit Password Reset with OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: "error", text: "Registered email is required." });
      return;
    }
    if (!forgotOtp.trim()) {
      setForgotMsg({ type: "error", text: "Please enter the 6-digit OTP code sent to your email." });
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsResetting(true);
    setForgotMsg(null);
    try {
      const res = await adminService.resetPasswordWithOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        new_password: forgotNewPass
      });
      setForgotMsg({
        type: "success",
        text: res.message || "Password reset successfully! You can now sign in."
      });
      // Pre-fill email on login form
      setEmail(forgotEmail.trim());
      setPassword("");
      // Switch back to login form after brief delay
      setTimeout(() => {
        setIsForgotMode(false);
        setForgotMsg(null);
        setOtpSent(false);
        setForgotOtp("");
        setForgotNewPass("");
        setForgotConfirmPass("");
      }, 2500);
    } catch (err) {
      setForgotMsg({
        type: "error",
        text: err.message || "Failed to reset password."
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Logo & Header */}
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <Sprout size={32} strokeWidth={2.4} />
          </div>
          <h2 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
            {isForgotMode ? "Reset Password" : "Admin Panel"}
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
            {isForgotMode
              ? "Verify your email to create a new password"
              : "Sign in to manage vegetables, orders, and pricing"}
          </p>
        </div>

        {/* --- VIEW 1: STANDARD LOGIN FORM --- */}
        {!isForgotMode ? (
          <>
            {/* Error Alert */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem"
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-email">
                  <span>Admin Email</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={18}
                    style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                  />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. abc@gmail.com"
                    className="form-input"
                    style={{ paddingLeft: "2.75rem" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <label className="form-label" htmlFor="admin-password" style={{ margin: 0 }}>
                    <span>Password</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError(null);
                      setForgotMsg(null);
                      if (email) setForgotEmail(email);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#15803d",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={18}
                    style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                  />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.85rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8"
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-admin-primary"
                style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "0.5rem" }}
              >
                <span>{isSubmitting ? "Signing In..." : "Login to Admin"}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </>
        ) : (
          /* --- VIEW 2: FORGOT PASSWORD WITH EMAIL OTP --- */
          <div>
            {forgotMsg && (
              <div
                style={{
                  background: forgotMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                  border: forgotMsg.type === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                  color: forgotMsg.type === "success" ? "#166534" : "#dc2626",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem"
                }}
              >
                {forgotMsg.type === "success" ? (
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            <form onSubmit={otpSent ? handleResetPasswordSubmit : handleRequestForgotOtp} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Registered Admin Email</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={18}
                    style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                  />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="abc@gmail.com"
                    className="form-input"
                    style={{ paddingLeft: "2.75rem" }}
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="submit"
                  disabled={isSendingOtp || !forgotEmail}
                  className="btn-admin-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "0.5rem" }}
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw size={17} className="spin-icon" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      <span>Send Verification Code</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        <span>6-Digit Verification OTP</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRequestForgotOtp}
                        disabled={isSendingOtp || countdown > 0}
                        style={{
                          background: "none",
                          border: "none",
                          color: countdown > 0 ? "#94a3b8" : "#15803d",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: countdown > 0 ? "not-allowed" : "pointer",
                          padding: 0
                        }}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                      </button>
                    </div>

                    <div style={{ position: "relative" }}>
                      <KeyRound
                        size={18}
                        style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                      />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="e.g. 123456"
                        className="form-input"
                        style={{ paddingLeft: "2.75rem", letterSpacing: "3px", fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>New Password</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock
                        size={18}
                        style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                      />
                      <input
                        type={showForgotNewPass ? "text" : "password"}
                        required
                        minLength={6}
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="form-input"
                        style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                        style={{
                          position: "absolute",
                          right: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8"
                        }}
                      >
                        {showForgotNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Confirm New Password</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock
                        size={18}
                        style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                      />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        className="form-input"
                        style={{ paddingLeft: "2.75rem" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting || !forgotOtp || !forgotNewPass}
                    className="btn-admin-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "0.85rem", marginTop: "0.5rem" }}
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw size={17} className="spin-icon" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        <span>Confirm & Reset Password</span>
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setForgotMsg(null);
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  marginTop: "0.25rem"
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer Link */}
        <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.82rem", color: "#94a3b8" }}>
          <a href="/" style={{ color: "#15803d", fontWeight: 700, textDecoration: "none" }}>
            ← Back to Customer Store
          </a>
        </div>
      </div>
    </div>
  );
}
