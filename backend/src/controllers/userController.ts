import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Return all users for assignment purposes
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
