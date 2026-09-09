import { query } from "./db.js";

async function checkAndEnhance() {
  const cols = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'hero_banners'"
  );
  const colNames = cols.map((c) => c.column_name);
  console.log("Current columns:", colNames);

  // Ensure discount_badge column exists
  if (!colNames.includes("discount_badge")) {
    await query("ALTER TABLE hero_banners ADD COLUMN discount_badge VARCHAR(255) DEFAULT 'UP TO 40% OFF ON SELECTED VEGETABLES'");
    console.log("Added column discount_badge");
  }

  // Update existing rows with discount_badge if null
  await query("UPDATE hero_banners SET discount_badge = 'UP TO 40% OFF ON SELECTED VEGETABLES' WHERE discount_badge IS NULL");

  // Let's update Slide 1 to match the reference banner
  await query(`
    UPDATE hero_banners 
    SET 
      title = 'Nature''s Goodness',
      highlight_text = 'Straight to Your Plate',
      subtitle = 'Fresh, chemical-free vegetables, handpicked from local farms for a healthier you and your family.',
      badge_text = '100% Fresh & Organic',
      discount_badge = 'UP TO 40% OFF ON SELECTED VEGETABLES',
      primary_cta_text = 'Shop Fresh Vegetables',
      image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&auto=format&fit=crop&q=85',
      is_active = true,
      sort_order = 1
    WHERE id = 1
  `);

  console.log("Updated slide 1 with reference banner content!");
}

checkAndEnhance().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
