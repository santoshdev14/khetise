import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { query } from "../db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads/banner-images");

// Ensure banner uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for banner images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const cleanBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    cb(null, `hero_banner_${cleanBaseName}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpeg|jpg|png|webp|gif|svg|avif|jfif|bmp)$/i;
  const isAllowedExt = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const isImageMime = file.mimetype && file.mimetype.startsWith("image/");
  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error("Uploaded file is not a supported image format."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB limit
  fileFilter
});

const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.warn("Banner upload error:", err.message);
      return res.status(400).json({ error: err.message || "Invalid banner upload." });
    }
    next();
  });
};

const router = express.Router();

/**
 * Format raw SQL row to clean camelCase JSON
 */
function formatBanner(b) {
  return {
    id: b.id,
    title: b.title || "",
    highlightText: b.highlight_text || "",
    subtitle: b.subtitle || "",
    badgeText: b.badge_text || "",
    badgeType: b.badge_type || "badge-harvest",
    discountBadge: b.discount_badge || "UP TO 40% OFF ON SELECTED VEGETABLES",
    imageUrl: b.image_url || "",
    primaryCtaText: b.primary_cta_text || "Shop Fresh Vegetables",
    primaryCtaAction: b.primary_cta_action || "shop",
    secondaryCtaText: b.secondary_cta_text || "Direct Inquiry",
    secondaryCtaLink: b.secondary_cta_link || "whatsapp",
    sortOrder: b.sort_order || 1,
    isActive: b.is_active !== false,
    createdAt: b.created_at,
    updatedAt: b.updated_at
  };
}

/**
 * PUBLIC: GET /api/banners
 * Returns all active hero banners for customer site
 */
router.get("/banners", async (req, res) => {
  try {
    const rows = await query(`
      SELECT * FROM hero_banners 
      WHERE is_active = true 
      ORDER BY sort_order ASC, id ASC
    `);
    res.json(rows.map(formatBanner));
  } catch (error) {
    console.error("Public fetch banners error:", error);
    res.status(500).json({ error: "Failed to fetch hero banners." });
  }
});

/**
 * ADMIN: GET /api/admin/banners
 * Returns all banners (active + inactive) for admin management
 */
router.get("/admin/banners", authenticateAdmin, async (req, res) => {
  try {
    const rows = await query(`
      SELECT * FROM hero_banners 
      ORDER BY sort_order ASC, id ASC
    `);
    res.json(rows.map(formatBanner));
  } catch (error) {
    console.error("Admin fetch banners error:", error);
    res.status(500).json({ error: "Failed to fetch admin banners." });
  }
});

/**
 * ADMIN: POST /api/admin/banners
 * Create a new hero banner
 */
router.post("/admin/banners", authenticateAdmin, handleUpload("imageFile"), async (req, res) => {
  try {
    const {
      title,
      highlight_text,
      subtitle,
      badge_text,
      discount_badge,
      image_url,
      primary_cta_text,
      primary_cta_action,
      secondary_cta_text,
      secondary_cta_link,
      sort_order,
      is_active
    } = req.body;

    let finalImageUrl = image_url || "";
    if (req.file) {
      finalImageUrl = `/uploads/banner-images/${req.file.filename}`;
    }

    if (!finalImageUrl) {
      return res.status(400).json({ error: "Banner image is required (either file upload or image URL)." });
    }

    const cleanTitle = (title || "").trim();
    const cleanHighlight = (highlight_text || "").trim();
    const cleanSubtitle = (subtitle || "").trim();
    const cleanBadge = (badge_text || "100% Fresh & Organic").trim();
    const cleanDiscount = (discount_badge || "UP TO 40% OFF ON SELECTED VEGETABLES").trim();
    const cleanCta = (primary_cta_text || "Shop Fresh Vegetables").trim();
    const cleanSortOrder = parseInt(sort_order, 10) || 1;
    const cleanIsActive = is_active === "false" || is_active === false ? false : true;

    const result = await query(
      `INSERT INTO hero_banners 
       (title, highlight_text, subtitle, badge_text, discount_badge, image_url, primary_cta_text, primary_cta_action, secondary_cta_text, secondary_cta_link, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanTitle,
        cleanHighlight,
        cleanSubtitle,
        cleanBadge,
        cleanDiscount,
        finalImageUrl,
        cleanCta,
        primary_cta_action || "shop",
        secondary_cta_text || "Direct Inquiry",
        secondary_cta_link || "whatsapp",
        cleanSortOrder,
        cleanIsActive
      ]
    );

    res.status(201).json({
      success: true,
      message: "Hero banner created successfully.",
      id: result[0]?.id
    });
  } catch (error) {
    console.error("Create hero banner error:", error);
    res.status(500).json({ error: error.message || "Failed to create hero banner." });
  }
});

/**
 * ADMIN: PUT /api/admin/banners/:id
 * Update an existing hero banner
 */
router.put("/admin/banners/:id", authenticateAdmin, handleUpload("imageFile"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query("SELECT * FROM hero_banners WHERE id = ? LIMIT 1", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Hero banner not found." });
    }

    const {
      title,
      highlight_text,
      subtitle,
      badge_text,
      discount_badge,
      image_url,
      primary_cta_text,
      primary_cta_action,
      secondary_cta_text,
      secondary_cta_link,
      sort_order,
      is_active
    } = req.body;

    let finalImageUrl = image_url !== undefined ? image_url : existing[0].image_url;
    if (req.file) {
      finalImageUrl = `/uploads/banner-images/${req.file.filename}`;
    }

    const cleanIsActive =
      is_active !== undefined
        ? is_active === "true" || is_active === true
        : existing[0].is_active;

    await query(
      `UPDATE hero_banners
       SET title = ?, highlight_text = ?, subtitle = ?, badge_text = ?, discount_badge = ?, image_url = ?, primary_cta_text = ?, primary_cta_action = ?, secondary_cta_text = ?, secondary_cta_link = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing[0].title,
        highlight_text !== undefined ? highlight_text.trim() : existing[0].highlight_text,
        subtitle !== undefined ? subtitle.trim() : existing[0].subtitle,
        badge_text !== undefined ? badge_text.trim() : existing[0].badge_text,
        discount_badge !== undefined ? discount_badge.trim() : existing[0].discount_badge,
        finalImageUrl,
        primary_cta_text !== undefined ? primary_cta_text.trim() : existing[0].primary_cta_text,
        primary_cta_action || existing[0].primary_cta_action,
        secondary_cta_text !== undefined ? secondary_cta_text.trim() : existing[0].secondary_cta_text,
        secondary_cta_link || existing[0].secondary_cta_link,
        sort_order !== undefined ? parseInt(sort_order, 10) : existing[0].sort_order,
        cleanIsActive,
        id
      ]
    );

    res.json({ success: true, message: "Hero banner updated successfully." });
  } catch (error) {
    console.error("Update hero banner error:", error);
    res.status(500).json({ error: error.message || "Failed to update hero banner." });
  }
});

/**
 * ADMIN: PATCH /api/admin/banners/:id/status
 * Toggle active / inactive status
 */
router.patch("/admin/banners/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await query("UPDATE hero_banners SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      Boolean(is_active),
      id
    ]);

    res.json({ success: true, message: `Banner status updated to ${is_active ? "active" : "inactive"}.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update banner status." });
  }
});

/**
 * ADMIN: DELETE /api/admin/banners/:id
 */
router.delete("/admin/banners/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM hero_banners WHERE id = ?", [id]);
    res.json({ success: true, message: "Hero banner deleted successfully." });
  } catch (error) {
    console.error("Failed to delete hero banner:", error);
    res.status(500).json({ error: error.message || "Failed to delete hero banner." });
  }
});

export default router;
