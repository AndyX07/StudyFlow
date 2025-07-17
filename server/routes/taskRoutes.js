import express from 'express';
import { authorize } from '../middleware/authMiddleware.js';
import { getTaskById, createTask, updateTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/:taskId', authorize, getTaskById);
router.post('/:courseId', authorize, createTask);
router.put('/:taskId', authorize, updateTask); 

export default router;
