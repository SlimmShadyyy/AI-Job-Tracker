import express from 'express';
import { createApplication, getApplications, updateApplicationStatus, deleteApplication } from '../controllers/appController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createApplication);
router.get('/', protect, getApplications);
router.patch('/:id/status', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);

export default router;