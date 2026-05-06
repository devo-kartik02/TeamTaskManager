import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ActivityLog from '../models/ActivityLog';

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    
    let filter: any = {};
    if (projectId) filter.projectId = projectId;

    const activities = await ActivityLog.find(filter)
      .populate('userId', 'name email')
      .populate('taskId', 'title')
      .sort('-createdAt')
      .limit(50);
      
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
