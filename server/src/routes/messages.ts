import express from 'express';
import { getMessages, sendMessage, markChannelRead } from '../controllers/messageController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:channelId', authMiddleware, getMessages);
router.post('/send', authMiddleware, sendMessage);
router.post('/read', authMiddleware, markChannelRead);

export default router;
