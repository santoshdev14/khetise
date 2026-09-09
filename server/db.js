import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from server folder
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

// Ensure uploads folder exists in server
const uploadsDir = path.join(__dirname, "uploads/product-images");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Parse PostgreSQL numeric and bigint types to standard JavaScript numbers
pg.types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val))); // NUMERIC / DECIMAL
pg.types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));  // BIGINT / INT8 / COUNT(*)

// Dynamic SSL detection for CockroachDB and production PostgreSQL
const requiresSsl =
  process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes("cockroachlabs.cloud") ||
      process.env.DATABASE_URL.includes("sslmode=require") ||
      process.env.DATABASE_URL.includes("sslmode=verify-full")));

const sslConfig = requiresSsl ? { rejectUnauthorized: false } : false;

// Configure PostgreSQL connection pool
export const pool = new pg.Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "test_db",
        user: process.env.DB_USER || "postgres",
        password: String(process.env.DB_PASSWORD || "123456"),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: sslConfig
      }
);

pool.on("connect", () => {
  // Client connected to PostgreSQL pool
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

/**
 * Universal query runner for PostgreSQL
 * Converts '?' placeholders to '$1, $2...'
 * Automatically appends 'RETURNING *' to INSERT statements if not present
 */
export async function query(sql, params = []) {
  let index = 1;
  let pgSql = sql.replace(/\?/g, () => `$${index++}`);

  // If it's an INSERT statement without RETURNING, append RETURNING * so result[0] has ID and row fields
  const trimmed = pgSql.trim();
  if (
    trimmed.toUpperCase().startsWith("INSERT INTO") &&
    !trimmed.toUpperCase().includes("RETURNING")
  ) {
    pgSql = `${trimmed} RETURNING *`;
  }

  const res = await pool.query(pgSql, params);
  return res.rows;
}

import bcrypt from "bcryptjs";

/**
 * Verify PostgreSQL Database Connection & Initialize Tables
 */
export async function initDb() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully. Server time:", res.rows[0]?.now);

    // 1. Ensure admins table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Ensure admin_otps table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_otps (
        id SERIAL PRIMARY KEY,
        admin_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        purpose VARCHAR(50) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Ensure categories table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Ensure products table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        hindi_name VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        unit VARCHAR(50) NOT NULL DEFAULT 'Kg',
        category_name VARCHAR(255) DEFAULT 'Daily Essentials',
        image_url TEXT,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        sort_order INT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Ensure orders table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        landmark VARCHAR(255),
        instructions TEXT,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Ensure order_items table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
        unit VARCHAR(50) DEFAULT 'Kg',
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Ensure settings table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Ensure hero_banners table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        highlight_text VARCHAR(255),
        subtitle TEXT,
        badge_text VARCHAR(255),
        badge_type VARCHAR(50) DEFAULT 'badge-harvest',
        discount_badge VARCHAR(255) DEFAULT 'UP TO 40% OFF ON SELECTED VEGETABLES',
        image_url TEXT,
        primary_cta_text VARCHAR(100) DEFAULT 'Shop Fresh Vegetables',
        primary_cta_action VARCHAR(50) DEFAULT 'shop',
        secondary_cta_text VARCHAR(100) DEFAULT 'Direct Inquiry',
        secondary_cta_link VARCHAR(50) DEFAULT 'whatsapp',
        sort_order INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default settings if missing
    await pool.query(`
      INSERT INTO settings (key, value) VALUES
        ('store_name', 'Kheti Se'),
        ('tagline', 'Seedha Khet Se, Aapke Ghar Tak'),
        ('whatsapp_number', '917507198468'),
        ('phone_number', '+91 75071 98468'),
        ('min_order_amount', '100'),
        ('free_delivery_above', '249'),
        ('delivery_charge', '25'),
        ('timings', 'Morning 7:00 AM - Evening 8:30 PM'),
        ('delivery_info', 'Local city delivery within 10km radius')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Seed default categories if empty
    const catCount = await pool.query("SELECT COUNT(*) as count FROM categories");
    if (parseInt(catCount.rows[0]?.count || "0", 10) === 0) {
      const defaultCats = [
        "Daily Essentials",
        "Leafy Greens",
        "Salads & Herbs",
        "Gourds & Specials"
      ];
      for (const cat of defaultCats) {
        await pool.query("INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [cat]);
      }
      console.log("🌱 Default categories seeded.");
    }

    // Seed default products if empty
    const prodCount = await pool.query("SELECT COUNT(*) as count FROM products");
    if (parseInt(prodCount.rows[0]?.count || "0", 10) === 0) {
      const defaultProducts = [
        { name: "Fresh Tomato", hindi_name: "देसी टमाटर (Tamatar)", price: 40, unit: "Kg", category: "Daily Essentials", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80", description: "Juicy, ripe red farm-fresh tomatoes with rich flavor, perfect for curries and salads.", sort_order: 1 },
        { name: "Fresh Potato", hindi_name: "आलू (Aloo)", price: 30, unit: "Kg", category: "Daily Essentials", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80", description: "Firm, clean, high-quality potatoes suitable for daily boiling, roasting, and curries.", sort_order: 2 },
        { name: "Red Onion", hindi_name: "लाल प्याज़ (Pyaaz)", price: 35, unit: "Kg", category: "Daily Essentials", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80", description: "Crisp and pungent red onions, hand-sorted for long-lasting freshness.", sort_order: 3 },
        { name: "Green Cabbage", hindi_name: "पत्ता गोभी (Patta Gobhi)", price: 30, unit: "Pc", category: "Daily Essentials", image: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80", description: "Crisp, compact green cabbage packed with natural dietary fiber and minerals.", sort_order: 4 },
        { name: "Fresh Cauliflower", hindi_name: "फूल गोभी (Phool Gobhi)", price: 45, unit: "Pc", category: "Daily Essentials", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80", description: "Bright white, clean-cut cauliflower heads from morning harvest.", sort_order: 5 },
        { name: "Farm Spinach (Palak)", hindi_name: "पालक (Palak)", price: 25, unit: "Bunch", category: "Leafy Greens", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80", description: "Tender, nutrient-packed dark green spinach leaves, harvested at dawn.", sort_order: 6 },
        { name: "Fresh Coriander", hindi_name: "हरा धनिया (Dhaniya)", price: 15, unit: "Bunch", category: "Leafy Greens", image: "https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=600&auto=format&fit=crop&q=80", description: "Aromatic coriander bunch with intense fresh aroma for curries and garnishes.", sort_order: 7 },
        { name: "Fresh Mint (Pudina)", hindi_name: "पुदीना (Pudina)", price: 15, unit: "Bunch", category: "Leafy Greens", image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80", description: "Refreshing aromatic mint leaves for delicious chutneys, teas, and summer coolers.", sort_order: 8 },
        { name: "Green Cucumber (Kheera)", hindi_name: "देसी खीरा (Kheera)", price: 30, unit: "Kg", category: "Salads & Herbs", image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600&auto=format&fit=crop&q=80", description: "Cool, refreshing, seedless local cucumbers ideal for healthy salads and raita.", sort_order: 9 },
        { name: "Juicy Lemon", hindi_name: "नींबू (Nimboo)", price: 10, unit: "Pc", category: "Salads & Herbs", image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600&auto=format&fit=crop&q=80", description: "Thin-skinned, high-juice yellow lemons bursting with natural Vitamin C.", sort_order: 10 },
        { name: "Fresh Ginger (Adrak)", hindi_name: "अदरक (Adrak)", price: 30, unit: "100g", category: "Salads & Herbs", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80", description: "Spicy and pungent soil-washed ginger roots for tea, immunity, and tadka.", sort_order: 11 },
        { name: "Bottle Gourd (Lauki)", hindi_name: "लौकी (Lauki)", price: 35, unit: "Pc", category: "Gourds & Specials", image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80", description: "Light green, tender, pesticide-free lauki perfect for light summer gravies.", sort_order: 12 },
        { name: "Fresh Bhindi (Okra)", hindi_name: "भिंडी (Bhindi)", price: 40, unit: "Kg", category: "Gourds & Specials", image: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80", description: "Crisp, tender green ladyfingers that snap easily, free from fibrous strings.", sort_order: 13 },
        { name: "Green Capsicum", hindi_name: "शिमला मिर्च (Shimla Mirch)", price: 50, unit: "Kg", category: "Gourds & Specials", image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80", description: "Glossy, crunchy bell peppers with thick walls, great for stuffing or stir-fries.", sort_order: 14 }
      ];

      for (const p of defaultProducts) {
        await pool.query(
          `INSERT INTO products (name, hindi_name, price, unit, category_name, image_url, description, status, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)`,
          [p.name, p.hindi_name, p.price, p.unit, p.category, p.image, p.description, p.sort_order]
        );
      }
      console.log("🥬 Default farm products seeded.");
    }

    // Seed default hero banners if empty
    const bannerCount = await pool.query("SELECT COUNT(*) as count FROM hero_banners");
    if (parseInt(bannerCount.rows[0]?.count || "0", 10) === 0) {
      await pool.query(`
        INSERT INTO hero_banners (
          title, highlight_text, subtitle, badge_text, badge_type, discount_badge,
          image_url, primary_cta_text, primary_cta_action, secondary_cta_text,
          secondary_cta_link, sort_order, is_active
        ) VALUES (
          'Nature''s Goodness',
          'Straight to Your Plate',
          'Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family.',
          '100% Fresh & Organic',
          'badge-harvest',
          'UP TO 40% OFF ON SELECTED VEGETABLES',
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85',
          'Shop Fresh Vegetables',
          'shop',
          'Direct Inquiry',
          'whatsapp',
          1,
          true
        ), (
          'Fresh Morning Harvest',
          'Farm to Doorstep in Hours',
          'Locally sourced vegetables picked at dawn and delivered right to your kitchen table with 100% freshness guarantee.',
          'Daily Morning Delivery',
          'badge-fresh',
          'FREE DELIVERY ON ORDERS ABOVE ₹249',
          'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=1400&auto=format&fit=crop&q=85',
          'Explore Catalog',
          'shop',
          'Chat on WhatsApp',
          'whatsapp',
          2,
          true
        );
      `);
      console.log("🌾 Default hero banners seeded.");
    }

    // Seed default admin if empty
    const adminCount = await pool.query("SELECT COUNT(*) as count FROM admins");
    if (parseInt(adminCount.rows[0]?.count || "0", 10) === 0) {
      const defaultPasswordHash = bcrypt.hashSync("admin123", 10);
      await pool.query(
        `INSERT INTO admins (name, email, password_hash)
         VALUES ($1, $2, $3)`,
        ["Santosh Varma", "santoshvarma01814@gmail.com", defaultPasswordHash]
      );
      console.log("👤 Default admin account seeded (santoshvarma01814@gmail.com / admin123).");
    }
  } catch (err) {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
    throw err;
  }
}

export default pool;
