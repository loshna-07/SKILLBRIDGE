"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authenticateUser, uploadMiddleware_1.upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file was uploaded.' });
        return;
    }
    // Return the relative URL path
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
        message: 'File uploaded successfully.',
        fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
    });
});
exports.default = router;
