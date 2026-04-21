import { Request, Response } from 'express';
import User from '../models/User';
import Channel from '../models/Channel';
import Message from '../models/Message';
import Task from '../models/Task';
import { successResponse, errorResponse } from '../utils/responseHelper';

export const getStats = async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const channelCount = await Channel.countDocuments();
    const messageCount = await Message.countDocuments();
    const taskCount = await Task.countDocuments();

    return successResponse(res, {
      users: userCount,
      channels: channelCount,
      messages: messageCount,
      tasks: taskCount
    });
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return successResponse(res, users);
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User role updated successfully');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    // Optional: Clean up user data in other collections
    return successResponse(res, null, 'User deleted successfully');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};
