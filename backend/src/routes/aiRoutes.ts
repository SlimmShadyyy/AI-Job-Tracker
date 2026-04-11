import express from 'express';
import { parseJobDescription, streamCoverLetter } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. The original route for Auto-Filling the Job Description
router.post('/parse', protect, parseJobDescription);

// 2. The new route for Streaming the Cover Letter
router.post('/stream-cover-letter', protect, streamCoverLetter);

export default router;