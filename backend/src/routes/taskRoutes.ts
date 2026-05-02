import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { protect, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(authorizeRoles('Admin'), deleteTask);

export default router;
