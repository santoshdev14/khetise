import express from "express";
import { query } from "../db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * PUBLIC: POST /api/orders
 * Creates an order record in PostgreSQL when customer clicks WhatsApp order
 */
router.post("/orders", async (req, res) => {
  try {
    const {
      customer_name,
      mobile,
      address,
      landmark,
      instructions,
      subtotal,
      delivery_fee,
      total_amount,
      items
    } = req.body;

    if (!customer_name || !mobile || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Customer name, mobile, address, and items are required." });
    }

    const orderRes = await query(
      `INSERT INTO orders (customer_name, mobile, address, landmark, instructions, subtotal, delivery_fee, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        customer_name.trim(),
        mobile.trim(),
        address.trim(),
        (landmark || "").trim(),
        (instructions || "").trim(),
        parseFloat(subtotal) || 0,
        parseFloat(delivery_fee) || 0,
        parseFloat(total_amount) || 0
      ]
    );

    const orderId = orderRes[0]?.id;

    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit, price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id ? parseInt(item.product_id, 10) : null,
          item.product_name || "Vegetable",
          parseFloat(item.quantity) || 1,
          item.unit || "Kg",
          parseFloat(item.price) || 0,
          parseFloat(item.subtotal) || 0
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order record." });
  }
});

/**
 * ADMIN: GET /api/admin/orders
 */
router.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (CAST(id AS TEXT) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(mobile) LIKE ? OR LOWER(address) LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (status && status !== "all") {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (sort === "oldest") {
      sql += ` ORDER BY created_at ASC, id ASC`;
    } else {
      sql += ` ORDER BY created_at DESC, id DESC`;
    }

    const orders = await query(sql, params);

    // Fetch items for all returned orders
    for (const order of orders) {
      const items = await query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

/**
 * ADMIN: GET /api/admin/orders/:id
 */
router.get("/admin/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await query("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    const order = orders[0];
    order.items = await query("SELECT * FROM order_items WHERE order_id = ?", [id]);

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order details." });
  }
});

/**
 * ADMIN: PUT /api/admin/orders/:id/status
 */
router.put("/admin/orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    await query("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
    res.json({ success: true, message: `Order #${id} status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status." });
  }
});

export default router;
