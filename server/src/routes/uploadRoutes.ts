import { Router, Response } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { authenticateUser, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post(
  '/',
  authenticateUser,
  upload.single('file'),
  (req: AuthRequest, res: Response): void => {
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
  }
);

export default router;
