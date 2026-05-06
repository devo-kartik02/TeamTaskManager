import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { sendTaskAssignmentEmail } from '../utils/mailer';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, priority, assignee, search } = req.query;
    
    let filter: any = {};
    if (projectId) filter.projectId = projectId;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;
    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).populate('assignees', 'name email').populate('createdBy', 'name email').sort('order');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, assignees, deadline, order, projectId } = req.body;
    
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
      projectId,
    });

    const createdTask = await task.save();

    await ActivityLog.create({
      action: 'Created Task',
      details: `Task "${title}" was created.`,
      userId: req.user.id,
      taskId: createdTask._id,
      projectId: projectId || undefined,
    });

    if (assignees && assignees.length > 0) {
      for (const assigneeId of assignees) {
        const user = await User.findById(assigneeId);
        if (user) {
          await sendTaskAssignmentEmail(user.email, title, (req.user as any).name || 'Admin');
        }
      }
    }

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignees, deadline, order, projectId } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const oldStatus = task.status;
    const oldAssignees = task.assignees.map(a => a.toString());

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignees = assignees !== undefined ? assignees : task.assignees;
    task.deadline = deadline || task.deadline;
    task.order = order !== undefined ? order : task.order;
    task.projectId = projectId || task.projectId;

    const updatedTask = await task.save();

    if (oldStatus !== updatedTask.status && req.user) {
      await ActivityLog.create({
        action: 'Moved Task',
        details: `Task "${task.title}" moved to ${updatedTask.status}.`,
        userId: req.user.id,
        taskId: task._id,
        projectId: task.projectId,
      });
    }

    if (assignees && req.user) {
      const newAssignees = assignees.filter((a: any) => !oldAssignees.includes(a.toString()));
      for (const assigneeId of newAssignees) {
        const user = await User.findById(assigneeId);
        if (user) {
          await ActivityLog.create({
            action: 'Assigned Task',
            details: `Task "${task.title}" was assigned to ${user.name}.`,
            userId: req.user.id,
            taskId: task._id,
            projectId: task.projectId,
          });
          await sendTaskAssignmentEmail(user.email, task.title, (req.user as any).name || 'Admin');
        }
      }
    }

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

    const deletedTaskTitle = task.title;
    const projectId = task.projectId;
    await task.deleteOne();

    if (req.user) {
      await ActivityLog.create({
        action: 'Deleted Task',
        details: `Task "${deletedTaskTitle}" was deleted.`,
        userId: req.user.id,
        projectId: projectId,
      });
    }

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
