import express from 'express';
import { getActivities } from '../controllers/activityController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getActivities);

export default router;
