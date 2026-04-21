import express from 'express';
import {
  getChannels,
  getChannelById,
  createChannel,
  joinChannel,
  getChannelMembers,
  inviteToChannel
} from '../controllers/channelController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getChannels);
router.get('/:id', authMiddleware, getChannelById);
router.post('/create', authMiddleware, createChannel);
router.post('/join/:id', authMiddleware, joinChannel);
router.post('/:id/invite', authMiddleware, inviteToChannel);
router.get('/:id/members', authMiddleware, getChannelMembers);

export default router;
