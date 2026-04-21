import express from 'express';
import { getStats, getAllUsers, updateUserRole, deleteUser } from '../controllers/adminController';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require admin middleware
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

export default router;
