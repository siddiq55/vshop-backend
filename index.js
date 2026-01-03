import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const port = process.env.PORT || 4000;
const app = express();

// middleware
app.use(express.json());

// ---------------- CORS ----------------
const allowedOrigins = [
  "https://vshop-admin-one.vercel.app",
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).end(); // handle preflight
  next();
});

app.use('/addproduct', productRoutes);
app.use('/removeproduct', productRoutes);
app.use('/allproducts', productRoutes);
app.use('/products', productRoutes);


app.use('/', userRoutes);


// connect to DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
    





    // Cloudinary Configuration............................................................................
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload endpoint to Cloudinary.....................................................
app.post("/upload", async (req, res) => {
  // ✅ Set CORS headers for deployed frontend
  res.setHeader("Access-Control-Allow-Origin", "https://vshop-admin-one.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") return res.status(200).end();

  // Use Multer to handle file upload
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(500).json({ success: 0, message: err.message });
    if (!req.file) return res.status(400).json({ success: 0, message: "No file uploaded" });

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "upload/images", resource_type: "auto" },
        (error, result) => {
          if (error) return res.status(500).json({ success: 0, message: error.message });

          res.json({
            success: 1,
            file: {
              filename: result.public_id,
              originalname: req.file.originalname,
              size: req.file.size
            },
            imageUrl: result.secure_url
          });
        }
      );

      Readable.from(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      res.status(500).json({ success: 0, message: error.message });
    }
  });
});


//...............................................................................................

// MongoDB connection checking in vercel serverless function...........
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

app.get("/", async (req, res) => {
  try {
   
    await connectDB();

    // Check connection state
    const dbState = mongoose.connection.readyState; 
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    res.json({
      message: "Backend is running on Vercel 🚀",
      mongodb: dbState === 1 ? "Connected ✅" : "Not connected ❌",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

export default app;
