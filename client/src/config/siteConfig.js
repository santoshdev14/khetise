// Central configuration for Kheti Se
export const siteConfig = {
  storeName: "Kheti Se",
  tagline: "Seedha Khet Se, Aapke Ghar Tak",
  subTagline: "Taazgi Jo Seedha Khet Se Aaye",
  description: "Fresh vegetables, carefully selected and delivered directly to your doorstep from local farms.",
  
  // Business WhatsApp Number (format: country code + 10 digits without + or spaces)
  // Edit this single number to change where WhatsApp orders and inquiries are sent
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210", 
  whatsappDisplayNumber: "+91 98765 43210",
  
  // Google Sheets Product Database Configuration
  // You can provide either a full CSV export URL or a Google Spreadsheet ID
  googleSheets: {
    // 1. Direct CSV export URL (Generated via Google Sheet -> File -> Share -> Publish to web -> CSV)
    // Or via gviz/tq?tqx=out:csv
    csvUrl: import.meta.env.VITE_GOOGLE_SHEET_CSV_URL || "",
    
    // 2. Google Spreadsheet ID (from URL: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit)
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || "",
    
    // Sheet tab name (default: Sheet1)
    sheetName: "Sheet1",

    // Cache timeout in milliseconds (5 minutes = 300,000 ms)
    cacheTtlMs: 5 * 60 * 1000
  },

  // Delivery details
  delivery: {
    minimumOrderAmount: 100, // Minimum order ₹100
    freeDeliveryThreshold: 249, // Free delivery above ₹249
    standardDeliveryFee: 25,
    estimatedTime: "Same Day (Within 2-4 Hours)",
    serviceAreas: "Local city delivery within 10km radius"
  },

  // Store Timings
  timings: "Morning 7:00 AM - Evening 8:30 PM",
  operatingDays: "All 7 Days Open",
  
  // Trust Metrics
  trustBadges: [
    { label: "100% Fresh", detail: "Farm-picked daily" },
    { label: "Quality Checked", detail: "3-step grading" },
    { label: "Same-Day Delivery", detail: "Fast at your door" },
    { label: "Direct Farm-to-Home", detail: "No middlemen" }
  ]
};
