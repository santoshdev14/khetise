import express from "express";
import { query } from "../db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * PUBLIC: GET /api/settings
 */
router.get("/settings", async (req, res) => {
  try {
    const rows = await query("SELECT key, value FROM settings");
    const settingsMap = {};
    rows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch store settings." });
  }
});

/**
 * ADMIN: GET /api/admin/settings
 */
router.get("/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const rows = await query("SELECT key, value FROM settings");
    const settingsMap = {};
    rows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin settings." });
  }
});

/**
 * ADMIN: PUT /api/admin/settings
 */
router.put("/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body; // { whatsapp_number: "...", delivery_charge: "..." }

    for (const [key, value] of Object.entries(updates)) {
      const exists = await query("SELECT * FROM settings WHERE key = ?", [key]);
      if (exists.length > 0) {
        await query("UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?", [String(value), key]);
      } else {
        await query("INSERT INTO settings (key, value) VALUES (?, ?)", [key, String(value)]);
      }
    }

    res.json({ success: true, message: "Settings updated successfully." });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Failed to update settings." });
  }
});

export default router;
