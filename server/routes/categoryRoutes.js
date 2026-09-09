import express from "express";
import { query } from "../db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * PUBLIC: GET /api/categories
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = await query("SELECT id, name FROM categories WHERE status = 'active' ORDER BY id ASC");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

/**
 * ADMIN: GET /api/admin/categories
 */
router.get("/admin/categories", authenticateAdmin, async (req, res) => {
  try {
    const categories = await query("SELECT * FROM categories ORDER BY id ASC");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin categories." });
  }
});

/**
 * ADMIN: POST /api/admin/categories
 */
router.post("/admin/categories", authenticateAdmin, async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required." });
    }

    const result = await query("INSERT INTO categories (name, status) VALUES (?, ?)", [
      name.trim(),
      status || "active"
    ]);

    res.status(201).json({ success: true, message: "Category created", id: result[0]?.id });
  } catch (error) {
    if (error.message.includes("UNIQUE") || error.code === "23505") {
      return res.status(400).json({ error: "A category with this name already exists." });
    }
    res.status(500).json({ error: "Failed to create category." });
  }
});

/**
 * ADMIN: PUT /api/admin/categories/:id
 */
router.put("/admin/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    await query("UPDATE categories SET name = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      name.trim(),
      status || "active",
      id
    ]);

    res.json({ success: true, message: "Category updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category." });
  }
});

/**
 * ADMIN: DELETE /api/admin/categories/:id
 */
router.delete("/admin/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category." });
  }
});

export default router;
