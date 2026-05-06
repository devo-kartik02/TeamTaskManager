import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Project from '../models/Project';
import Task from '../models/Task';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().populate('members', 'name email').populate('createdBy', 'name email');
    
    // We also need to send the completion percentage for each project.
    // So we'll fetch all tasks or count them per project.
    const projectStats = await Promise.all(projects.map(async (project) => {
      const totalTasks = await Task.countDocuments({ projectId: project._id });
      const doneTasks = await Task.countDocuments({ projectId: project._id, status: 'DONE' });
      
      return {
        ...project.toObject(),
        totalTasks,
        doneTasks,
        completionPercentage: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
      };
    }));

    res.json(projectStats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, members } = req.body;
    
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const project = new Project({
      title,
      description,
      members: members || [],
      createdBy: req.user.id,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, members } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    project.title = title || project.title;
    project.description = description !== undefined ? description : project.description;
    project.members = members !== undefined ? members : project.members;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'Admin') {
      res.status(403).json({ message: 'Only admins can delete projects' });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    await project.deleteOne();
    // optionally delete all tasks associated with this project
    await Task.deleteMany({ projectId: id });

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
