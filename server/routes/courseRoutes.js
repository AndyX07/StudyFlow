import express from 'express';
import { authorize } from '../middleware/authMiddleware.js';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getTasksByCourseId } from '../controllers/courseController.js';

const router = express.Router();

router.get('/', authorize, getCourses);
router.get('/:id', authorize, getCourse);
router.get('/:id/tasks', authorize, getTasksByCourseId);
router.post('/', authorize, createCourse);
router.put('/:id', authorize, updateCourse);
router.delete('/:id', authorize, deleteCourse);


export default router;
