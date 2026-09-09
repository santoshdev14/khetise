import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { query } from "../db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads/product-images");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
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
    cb(null, `veggie_${cleanBaseName}_${uniqueSuffix}${ext}`);
  }
});

// Broad image file validation (supports all standard web & mobile image formats)
const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpeg|jpg|png|webp|gif|svg|avif|jfif|bmp|ico|tif|tiff)$/i;
  const isAllowedExt = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const isImageMime = file.mimetype && file.mimetype.startsWith("image/");

  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error("Uploaded file is not a supported image (JPG, PNG, WEBP, GIF, SVG, AVIF)."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Middleware wrapper to handle Multer upload errors gracefully
const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.warn("Upload validation issue:", err.message);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || "Invalid image upload." });
    }
    next();
  });
};

const router = express.Router();

/**
 * PUBLIC: GET /api/products
 * Returns active and out-of-stock products for customers
 */
router.get("/products", async (req, res) => {
  try {
    const products = await query(`
      SELECT 
        id, name, hindi_name as "hindiName", price, unit, 
        category_name as "category", image_url as "image", 
        description, status, sort_order,
        CASE WHEN LOWER(TRIM(COALESCE(status, 'active'))) = 'active' THEN true ELSE false END as available
      FROM products
      WHERE LOWER(TRIM(COALESCE(status, 'active'))) != 'inactive'
      ORDER BY sort_order ASC, id ASC
    `);
    res.json(products);
  } catch (error) {
    console.error("Public products fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

/**
 * PUBLIC: GET /api/products/:id
 */
router.get("/products/:id", async (req, res) => {
  try {
    const products = await query(
      `SELECT id, name, hindi_name as "hindiName", price, unit, 
              category_name as "category", image_url as "image", 
              description, status, sort_order,
              CASE WHEN LOWER(TRIM(COALESCE(status, 'active'))) = 'active' THEN true ELSE false END as available
       FROM products WHERE id = ? LIMIT 1`,
      [req.params.id]
    );
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product." });
  }
});

/**
 * ADMIN: POST /api/admin/upload (Single Image Upload)
 */
router.post("/admin/upload", authenticateAdmin, handleUpload("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
    const relativeUrl = `/uploads/product-images/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl: relativeUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to upload image." });
  }
});

/**
 * ADMIN: GET /api/admin/products
 */
router.get("/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(hindi_name) LIKE ? OR LOWER(description) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (category && category !== "all") {
      sql += ` AND category_name = ?`;
      params.push(category);
    }

    if (status && status !== "all") {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY sort_order ASC, id ASC`;
    const products = await query(sql, params);
    res.json(products);
  } catch (error) {
    console.error("Admin products fetch error:", error);
    res.status(500).json({ error: "Failed to fetch admin products." });
  }
});

/**
 * ADMIN: POST /api/admin/products
 */
router.post("/admin/products", authenticateAdmin, handleUpload("imageFile"), async (req, res) => {
  try {
    const {
      name,
      hindi_name,
      price,
      unit,
      category_name,
      image_url,
      description,
      status,
      sort_order
    } = req.body;

    if (!name || !price || !unit) {
      return res.status(400).json({ error: "Product name, price, and unit are required." });
    }

    let finalImageUrl = image_url || "";
    if (req.file) {
      finalImageUrl = `/uploads/product-images/${req.file.filename}`;
    }

    const cleanPrice = parseFloat(price) || 0;
    const cleanSortOrder = parseInt(sort_order, 10) || 1;
    const cleanStatus = status || "active";

    const result = await query(
      `INSERT INTO products (name, hindi_name, price, unit, category_name, image_url, description, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        (hindi_name || "").trim(),
        cleanPrice,
        unit.trim(),
        (category_name || "Daily Essentials").trim(),
        finalImageUrl.trim(),
        (description || "").trim(),
        cleanStatus,
        cleanSortOrder
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      id: result[0]?.id
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Failed to create product." });
  }
});

/**
 * ADMIN: PUT /api/admin/products/:id
 */
router.put("/admin/products/:id", authenticateAdmin, handleUpload("imageFile"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      hindi_name,
      price,
      unit,
      category_name,
      image_url,
      description,
      status,
      sort_order
    } = req.body;

    const existing = await query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    let finalImageUrl = image_url !== undefined ? image_url : existing[0].image_url;
    if (req.file) {
      finalImageUrl = `/uploads/product-images/${req.file.filename}`;
    }

    await query(
      `UPDATE products 
       SET name = ?, hindi_name = ?, price = ?, unit = ?, category_name = ?, image_url = ?, description = ?, status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing[0].name,
        hindi_name !== undefined ? hindi_name.trim() : existing[0].hindi_name,
        price !== undefined ? parseFloat(price) : existing[0].price,
        unit !== undefined ? unit.trim() : existing[0].unit,
        category_name !== undefined ? category_name.trim() : existing[0].category_name,
        finalImageUrl,
        description !== undefined ? description.trim() : existing[0].description,
        status !== undefined ? status : existing[0].status,
        sort_order !== undefined ? parseInt(sort_order, 10) : existing[0].sort_order,
        id
      ]
    );

    res.json({ success: true, message: "Product updated successfully." });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Failed to update product." });
  }
});

/**
 * ADMIN: PATCH /api/admin/products/:id/status
 */
router.patch("/admin/products/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'inactive', 'out_of_stock'

    if (!["active", "inactive", "out_of_stock"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    await query("UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
    res.json({ success: true, message: `Product marked as ${status}.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product status." });
  }
});

/**
 * ADMIN: DELETE /api/admin/products/:id
 */
router.delete("/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product." });
  }
});

export default router;
