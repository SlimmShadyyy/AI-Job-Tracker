import express from 'express';
import { streamCoverLetter } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/stream-cover-letter', protect, streamCoverLetter);

export default router;