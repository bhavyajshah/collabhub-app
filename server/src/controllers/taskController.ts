import { Response } from 'express';
import Task from '../models/Task';
import Channel from '../models/Channel';
import { AuthRequest } from '../middleware/authMiddleware';
import { successResponse, errorResponse, createdResponse, notFoundResponse } from '../utils/responseHelper';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { channelId } = req.params;

    // BUG FIX: Authorization check
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return errorResponse(res, 'Channel not found', 404);
    }
    const isMember = channel.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return errorResponse(res, 'Not authorized to view tasks', 403);
    }

    const tasks = await Task.find({ channelId })
      .populate('assignedUser', 'username')
      .sort({ createdAt: -1 });
    return successResponse(res, tasks);
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, channelId, assignedTo } = req.body;

    if (!title || !channelId) {
      return errorResponse(res, 'Title and channelId are required', 400);
    }

    // BUG FIX: Authorization check
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return errorResponse(res, 'Channel not found', 404);
    }
    const isMember = channel.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return errorResponse(res, 'Not authorized to create tasks', 403);
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim(),
      channelId,
      assignedUser: assignedTo || null,
      status: 'todo'
    });

    await task.save();
    const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username');
    return createdResponse(res, populatedTask, 'Task created');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.body;

    const taskToFind = await Task.findById(req.params.id);
    if (!taskToFind) {
      return notFoundResponse(res, 'Task not found');
    }

    // BUG FIX: Authorization check
    const channel = await Channel.findById(taskToFind.channelId);
    if (!channel || !channel.members.includes(req.user.id as any)) {
      return errorResponse(res, 'Not authorized to update tasks in this channel', 403);
    }

    // BUG FIX: Validate status
    const allowedStatuses = ['todo', 'in-progress', 'done'];
    if (status && !allowedStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400);
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedUser = assignedTo;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedUser', 'username');

    if (!task) {
      return notFoundResponse(res, 'Task not found');
    }

    return successResponse(res, task, 'Task updated');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return notFoundResponse(res, 'Task not found');
    }

    // BUG FIX: Authorization check
    const channel = await Channel.findById(task.channelId);
    if (!channel || !channel.members.some(m => m.toString() === req.user.id)) {
      return errorResponse(res, 'Not authorized to delete tasks in this channel', 403);
    }

    await Task.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Task deleted successfully');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};
