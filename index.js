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


const app = express();

// middleware
app.use(express.json());
app.use(cors());

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
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No files uploaded.' });
    }

    try {
        // Upload buffer to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'upload/images',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ 
                        success: 0, 
                        message: 'Cloudinary upload failed', 
                        error: error.message 
                    });
                }

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

        // Convert buffer to stream and upload
        Readable.from(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        res.status(500).json({ 
            success: 0, 
            message: 'Server error', 
            error: error.message 
        });
    }
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

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running on Vercel 🚀",
    timestamp: new Date().toISOString()
  });
});


export default app;
