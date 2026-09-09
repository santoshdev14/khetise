import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { generateToken, authenticateAdmin } from "../middleware/auth.js";
import { sendOtpEmail, PRIMARY_ADMIN_EMAIL } from "../utils/mailer.js";

const router = express.Router();

/**
 * POST /api/admin/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const admins = await query("SELECT * FROM admins WHERE email = ? LIMIT 1", [email.trim().toLowerCase()]);
    if (admins.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const admin = admins[0];
    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken({ id: admin.id, email: admin.email, name: admin.name });

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
});

/**
 * GET /api/admin/me (Validate token & get current profile)
 */
router.get("/me", authenticateAdmin, async (req, res) => {
  try {
    const admins = await query("SELECT id, name, email FROM admins WHERE id = ? LIMIT 1", [req.admin.id]);
    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin profile not found." });
    }
    res.json({ admin: admins[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin profile." });
  }
});

/**
 * POST /api/admin/request-otp
 * Generates and sends a 6-digit OTP to the admin's verified email address
 */
router.post("/request-otp", authenticateAdmin, async (req, res) => {
  try {
    const { purpose } = req.body; // 'profile_update' | 'password_change'
    if (!purpose || !["profile_update", "password_change"].includes(purpose)) {
      return res.status(400).json({ error: "Valid purpose ('profile_update' or 'password_change') is required." });
    }

    const admins = await query("SELECT id, name, email FROM admins WHERE id = ? LIMIT 1", [req.admin.id]);
    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    const admin = admins[0];
    // Target recipient: admin's configured email or fallback primary admin email
    const recipientEmail = admin.email || PRIMARY_ADMIN_EMAIL;

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

    // Invalidate existing OTPs for this admin and purpose
    await query("DELETE FROM admin_otps WHERE admin_id = ? AND purpose = ?", [admin.id, purpose]);

    // Store new OTP
    await query(
      "INSERT INTO admin_otps (admin_id, email, otp, purpose, expires_at) VALUES (?, ?, ?, ?, ?)",
      [admin.id, recipientEmail, otp, purpose, expiresAt]
    );

    // Send email via nodemailer
    const emailResult = await sendOtpEmail({
      toEmail: recipientEmail,
      otp,
      purpose,
      adminName: admin.name
    });

    // Mask email for display in UI: "s***4@gmail.com"
    const [localPart, domain] = recipientEmail.split("@");
    const maskedLocal = localPart.length > 2 ? `${localPart[0]}***${localPart[localPart.length - 1]}` : `${localPart[0]}***`;
    const maskedEmail = `${maskedLocal}@${domain}`;

    res.json({
      success: true,
      message: `Verification OTP sent to ${maskedEmail}. Valid for 10 minutes.`,
      maskedEmail,
      simulated: emailResult.simulated || false
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({ error: "Failed to generate and send OTP." });
  }
});

/**
 * POST /api/admin/update-profile
 * Updates name and/or email after OTP verification
 */
router.post("/update-profile", authenticateAdmin, async (req, res) => {
  try {
    const { name, email, otp } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Admin name/username is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Admin email address is required." });
    }
    if (!otp || !String(otp).trim()) {
      return res.status(400).json({ error: "Verification OTP is required." });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Verify OTP from database
    const validOtps = await query(
      "SELECT * FROM admin_otps WHERE admin_id = ? AND purpose = 'profile_update' AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [req.admin.id, cleanOtp]
    );

    if (validOtps.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification OTP. Please request a new code." });
    }

    // Check if new email is already used by another admin account
    const existing = await query("SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1", [cleanEmail, req.admin.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "An admin account with this email address already exists." });
    }

    // Update admin record
    await query(
      "UPDATE admins SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [cleanName, cleanEmail, req.admin.id]
    );

    // Consume/delete used OTP
    await query("DELETE FROM admin_otps WHERE admin_id = ? AND purpose = 'profile_update'", [req.admin.id]);

    // Issue fresh token with updated claims
    const token = generateToken({ id: req.admin.id, email: cleanEmail, name: cleanName });

    res.json({
      success: true,
      message: "Admin profile updated successfully.",
      token,
      admin: {
        id: req.admin.id,
        name: cleanName,
        email: cleanEmail
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update admin profile." });
  }
});

/**
 * POST /api/admin/change-password
 * Updates admin password after verifying current password and email OTP
 */
router.post("/change-password", authenticateAdmin, async (req, res) => {
  try {
    const { current_password, new_password, otp } = req.body;

    if (!current_password) {
      return res.status(400).json({ error: "Current password is required." });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }
    if (!otp || !String(otp).trim()) {
      return res.status(400).json({ error: "Verification OTP is required." });
    }

    const cleanOtp = String(otp).trim();

    // Verify current admin password
    const admins = await query("SELECT * FROM admins WHERE id = ? LIMIT 1", [req.admin.id]);
    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    const admin = admins[0];
    const isCurrentMatch = bcrypt.compareSync(current_password, admin.password_hash);
    if (!isCurrentMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    // Verify OTP from database
    const validOtps = await query(
      "SELECT * FROM admin_otps WHERE admin_id = ? AND purpose = 'password_change' AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [req.admin.id, cleanOtp]
    );

    if (validOtps.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification OTP. Please request a new code." });
    }

    // Hash new password and update
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(new_password, salt);

    await query(
      "UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newHash, req.admin.id]
    );

    // Consume/delete used OTP
    await query("DELETE FROM admin_otps WHERE admin_id = ? AND purpose = 'password_change'", [req.admin.id]);

    res.json({
      success: true,
      message: "Admin password changed successfully."
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password." });
  }
});

/**
 * PUBLIC: POST /api/admin/forgot-password/request-otp
 * Generates and sends a 6-digit OTP for admin password reset
 */
router.post("/forgot-password/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Registered admin email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admins = await query("SELECT * FROM admins WHERE email = ? LIMIT 1", [cleanEmail]);
    if (admins.length === 0) {
      return res.status(404).json({ error: "No admin account found with this email address." });
    }

    const admin = admins[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing forgot password OTPs
    await query("DELETE FROM admin_otps WHERE admin_id = ? AND purpose = 'forgot_password'", [admin.id]);

    // Insert new OTP
    await query(
      "INSERT INTO admin_otps (admin_id, email, otp, purpose, expires_at) VALUES (?, ?, ?, 'forgot_password', ?)",
      [admin.id, cleanEmail, otp, expiresAt]
    );

    // Send email
    await sendOtpEmail({
      toEmail: cleanEmail,
      otp,
      purpose: "forgot_password",
      adminName: admin.name
    });

    const [localPart, domain] = cleanEmail.split("@");
    const maskedLocal = localPart.length > 2 ? `${localPart[0]}***${localPart[localPart.length - 1]}` : `${localPart[0]}***`;
    const maskedEmail = `${maskedLocal}@${domain}`;

    res.json({
      success: true,
      message: `Password reset OTP sent to ${maskedEmail}. Valid for 10 minutes.`
    });
  } catch (error) {
    console.error("Forgot password OTP request error:", error);
    res.status(500).json({ error: "Failed to send password reset OTP." });
  }
});

/**
 * PUBLIC: POST /api/admin/forgot-password/reset
 * Resets admin password using verified OTP
 */
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!otp || !String(otp).trim()) {
      return res.status(400).json({ error: "Verification OTP is required." });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const admins = await query("SELECT * FROM admins WHERE email = ? LIMIT 1", [cleanEmail]);
    if (admins.length === 0) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    const admin = admins[0];

    // Verify OTP
    const validOtps = await query(
      "SELECT * FROM admin_otps WHERE admin_id = ? AND purpose = 'forgot_password' AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [admin.id, cleanOtp]
    );

    if (validOtps.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset OTP code. Please request a new one." });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(new_password, salt);

    await query(
      "UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newHash, admin.id]
    );

    // Invalidate used OTP
    await query("DELETE FROM admin_otps WHERE admin_id = ? AND purpose = 'forgot_password'", [admin.id]);

    res.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password."
    });
  } catch (error) {
    console.error("Forgot password reset error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

export default router;
