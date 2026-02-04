import { Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import { log } from '../utils/logger.js';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

router.get('/debug', (req, res) => {
    res.json({
        uploadDir,
        cwd: process.cwd(),
        exists: fs.existsSync(uploadDir),
        files: fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : []
    });
});

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WEBP)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Upload image endpoint
router.post('/image', authenticate, upload.single('image'), (req, res) => {
    try {
        log(`[Upload] Request received from user: ${req.user.id}`);
        if (!req.file) {
            log('[Upload] No file detected in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        log(`[Upload] File received: ${req.file.originalname} -> ${req.file.filename}`);

        // Create URL for the uploaded file
        const imageUrl = `/uploads/reports/${req.file.filename}`;

        console.log(`[Upload] Image uploaded: ${imageUrl} by user ${req.user.id}`);

        res.json({
            message: 'Image uploaded successfully',
            imageUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Error handling for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Ukuran file terlalu besar (maksimal 5MB)' });
        }
        return res.status(400).json({ error: error.message });
    }
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

export default router;
