import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find().populate('assignees', 'name email').populate('createdBy', 'name email').sort('order');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, assignees, deadline, order } = req.body;
    
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      assignees: assignees || [],
      createdBy: req.user.id,
      deadline,
      order: order || 0,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignees, deadline, order } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignees = assignees !== undefined ? assignees : task.assignees;
    task.deadline = deadline || task.deadline;
    task.order = order !== undefined ? order : task.order;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({ message: 'Only admins can delete tasks' });
      return;
    }

    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
