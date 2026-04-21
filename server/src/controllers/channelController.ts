import { Response } from 'express';
import Channel from '../models/Channel';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { successResponse, errorResponse, createdResponse, notFoundResponse } from '../utils/responseHelper';

export const getChannels = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // BUG FIX: Only return channels the user is a member of (unless they are public - for now, all are private to members)
    const query = { members: req.user.id };

    const channels = await Channel.find(query)
      .populate('members', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Channel.countDocuments(query);

    return successResponse(res, {
      channels,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalChannels: total
    });
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const getChannelById = async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('members', 'username');
    if (!channel) {
      return notFoundResponse(res, 'Channel not found');
    }

    // BUG FIX: Robust Authorization check using toString() for ObjectIds
    const isMember = channel.members.some(m =>
      (typeof m === 'string' ? m : (m as any)._id?.toString() || m.toString()) === req.user.id
    );

    if (!isMember) {
      return errorResponse(res, 'Not authorized to view this channel', 403);
    }

    return successResponse(res, channel);
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const createChannel = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, invitees } = req.body;

    if (!name || name.trim().length < 3) {
      return errorResponse(res, 'Channel name must be at least 3 characters', 400);
    }

    if (name.length > 50) {
      return errorResponse(res, 'Channel name is too long (max 50)', 400);
    }

    const membersSet = new Set([req.user.id]);

    if (invitees && typeof invitees === 'string') {
      const identifiers = invitees.split(',').map(s => s.trim()).filter(Boolean);
      
      if (identifiers.length > 0) {
        const usersFound = await User.find({
          $or: [
            { username: { $in: identifiers } },
            { email: { $in: identifiers.map(i => i.toLowerCase()) } }
          ]
        });
        
        usersFound.forEach(u => membersSet.add((u._id || u.id).toString()));
      }
    }

    const channel = new Channel({
      name: name.trim(),
      description,
      members: Array.from(membersSet),
      createdBy: req.user.id
    });

    await channel.save();
    return createdResponse(res, channel, 'Channel created');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const joinChannel = async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return notFoundResponse(res, 'Channel not found');
    }

    const isAlreadyMember = channel.members.some(m => m.toString() === req.user.id);
    if (isAlreadyMember) {
      return successResponse(res, channel, 'Already a member'); // BUG FIX: Return success if already joined
    }

    channel.members.push(req.user.id as any);
    await channel.save();
    return successResponse(res, channel, 'Joined channel');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const getChannelMembers = async (req: AuthRequest, res: Response) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('members', 'username email');
    if (!channel) {
      return notFoundResponse(res, 'Channel not found');
    }

    // BUG FIX: Authorization check
    if (!channel.members.some(m => m._id.toString() === req.user.id)) {
      return errorResponse(res, 'Not authorized to view members', 403);
    }

    return successResponse(res, channel.members);
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const inviteToChannel = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;
    if (!username) return errorResponse(res, 'Username or Email is required', 400);

    const channel = await Channel.findById(req.params.id);
    if (!channel) return notFoundResponse(res, 'Channel not found');

    const isMember = channel.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return errorResponse(res, 'Not authorized to invite to this channel', 403);
    }

    // Let user type username or email
    const userToInvite = await User.findOne({ 
      $or: [{ username: username }, { email: username.toLowerCase() }] 
    });

    if (!userToInvite) {
      return errorResponse(res, 'User not found in system', 404);
    }

    const isAlreadyMember = channel.members.some(m => m.toString() === userToInvite.id);
    if (isAlreadyMember) {
      return successResponse(res, channel, 'User is already a member');
    }

    channel.members.push(userToInvite.id as any);
    await channel.save();
    
    // Optional: Return populated channel to update UI properly
    const updatedChannel = await Channel.findById(req.params.id).populate('members', 'username email');
    
    return successResponse(res, updatedChannel, 'User invited successfully');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};
