import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDb } from "./db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware (supports all origins & handles preflight)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded product images from server/uploads
const serverUploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(serverUploadsPath)) {
  fs.mkdirSync(serverUploadsPath, { recursive: true });
}
const productImagesDir = path.join(serverUploadsPath, "product-images");
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(serverUploadsPath));

const rootUploadsPath = path.join(__dirname, "../uploads");
if (fs.existsSync(rootUploadsPath)) {
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  }, express.static(rootUploadsPath));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Mount Routes
app.use("/api/admin", authRoutes);
app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", orderRoutes);
app.use("/api", settingRoutes);
app.use("/api", statsRoutes);
app.use("/api", bannerRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Initialize Database and Start Server
async function startServer() {
  try {
    await initDb();
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`=========================================`);
      console.log(`🌾 Kheti Se Backend API running on port ${PORT}`);
      console.log(`🚀 http://localhost:${PORT}`);
      console.log(`=========================================`);
    });

    // Keep process alive
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
}

startServer();
