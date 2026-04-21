import { useState, useCallback, useEffect } from 'react';
import api from '../api';

export const useTasks = (channelId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${channelId}`);
      setTasks(res.data.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const createTask = useCallback(async (title, description, assignedTo) => {
    if (!channelId || !title.trim() || creating) return null;
    setCreating(true);
    try {
      const res = await api.post('/tasks/create', {
        title: title.trim(),
        description: description?.trim(),
        channelId,
        assignedTo
      });
      const newTask = res.data.data;
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
      return null;
    } finally {
      setCreating(false);
    }
  }, [channelId, creating]);

  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/update/${taskId}`, { status: newStatus });
      const updatedTask = res.data.data;
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task status');
      console.error(err);
      return null;
    }
  }, []);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/update/${taskId}`, updates);
      const updatedTask = res.data.data;
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      return true;
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
      return false;
    }
  }, []);

  const handleIncomingTaskUpdate = useCallback((data) => {
    if (data.deleted) {
      setTasks(prev => prev.filter(t => t._id !== data.taskId));
    } else if (data.task) {
      setTasks(prev => {
        const exists = prev.find(t => t._id === data.task._id);
        if (exists) {
          return prev.map(t => t._id === data.task._id ? data.task : t);
        }
        return [data.task, ...prev];
      });
    } else {
      fetchTasks();
    }
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks, loading, creating, error,
    fetchTasks, createTask, updateTaskStatus, updateTask, deleteTask,
    handleIncomingTaskUpdate
  };
};
