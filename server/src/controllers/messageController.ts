import { Response } from 'express';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/authMiddleware';
import { successResponse, errorResponse, createdResponse } from '../utils/responseHelper';

import Channel from '../models/Channel';
import User from '../models/User';

const MESSAGE_TYPES = ['standard', 'update', 'decision', 'blocker'] as const;

const isChannelMember = (channel: any, userId: string) =>
  channel.members.some((member: any) => {
    if (!member) return false;
    if (typeof member === 'string') return member === userId;
    if (member._id) return member._id.toString() === userId;
    return member.toString() === userId;
  });

const getMessagePopulation = () =>
  Message.find().populate('sender', 'username email').populate('readBy.user', 'username email');

const sanitizeMessageType = (type: unknown) => {
  if (typeof type !== 'string') return 'standard';
  return MESSAGE_TYPES.includes(type as typeof MESSAGE_TYPES[number])
    ? type
    : 'standard';
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // BUG FIX: Authorization check - is user member of channel?
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return errorResponse(res, 'Channel not found', 404);
    }
    if (!isChannelMember(channel, req.user.id)) {
      return errorResponse(res, 'Not authorized to view messages', 403);
    }

    const messages = await Message.find({ channelId })
      .populate('sender', 'username email')
      .populate('readBy.user', 'username email')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ channelId });

    return successResponse(res, {
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId, content, text, type, replyToId } = req.body;
    const messageContent = content || text;

    if (!channelId || !messageContent) {
      return errorResponse(res, 'Channel ID and content are required', 400);
    }

    if (messageContent.length > 5000) {
      return errorResponse(res, 'Message too long (max 5000)', 400);
    }

    // BUG FIX: Authorization check - is user member of channel?
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return errorResponse(res, 'Channel not found', 404);
    }
    if (!isChannelMember(channel, req.user.id)) {
      return errorResponse(res, 'Not authorized to send messages to this channel', 403);
    }

    let replyPreview;
    if (replyToId) {
      const replySource = await Message.findOne({ _id: replyToId, channelId })
        .populate('sender', 'username');
      if (replySource) {
        const replySender = replySource.sender as any;
        replyPreview = {
          messageId: replySource._id,
          senderId: replySender?._id || replySource.sender,
          senderName: replySender?.username || 'User',
          content: replySource.content,
          type: replySource.type || 'standard'
        };
      }
    }

    const message = new Message({
      channelId,
      sender: req.user.id,
      content: messageContent.trim(),
      type: sanitizeMessageType(type),
      replyPreview,
      readBy: [{ user: req.user.id, readAt: new Date() }]
    });

    await message.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email')
      .populate('readBy.user', 'username email');
    return createdResponse(res, populatedMessage, 'Message sent');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const markChannelRead = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.body;

    if (!channelId) {
      return errorResponse(res, 'Channel ID is required', 400);
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return errorResponse(res, 'Channel not found', 404);
    }
    if (!isChannelMember(channel, req.user.id)) {
      return errorResponse(res, 'Not authorized to read this channel', 403);
    }

    const unreadMessages = await Message.find({
      channelId,
      sender: { $ne: req.user.id },
      'readBy.user': { $ne: req.user.id }
    }).select('_id');

    const messageIds = unreadMessages.map(message => message._id);
    if (messageIds.length === 0) {
      return successResponse(res, {
        channelId,
        messageIds: [],
        user: {
          _id: req.user.id
        }
      }, 'Channel already read');
    }

    const readAt = new Date();

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $push: { readBy: { user: req.user.id, readAt } } }
    );

    const readUser = await User.findById(req.user.id).select('username email');

    return successResponse(res, {
      channelId,
      messageIds,
      user: {
        _id: req.user.id,
        username: readUser?.username || 'User',
        email: readUser?.email,
        readAt
      }
    }, 'Channel marked as read');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};
