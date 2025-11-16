import express from 'express';
import { authorize } from '../middleware/authMiddleware.js';
import {
  createGroup,
  getUserGroups,
  getGroupById,
  addMember,
  removeMember,
  getGroupMessages,
  leaveGroup,
  deleteGroup,
  addMessage
} from '../controllers/studyGroupController.js';
import {
  createGroupTask,
  getGroupTasks,
  updateGroupTask,
  deleteGroupTask
} from '../controllers/groupTaskController.js';

const router = express.Router();

router.post('/', authorize, createGroup);
router.get('/', authorize, getUserGroups);
router.get('/:id', authorize, getGroupById);
router.post('/:id/members', authorize, addMember);
router.delete('/:id/members', authorize, removeMember);
router.post('/:id/leave', authorize, leaveGroup);
router.delete('/:id', authorize, deleteGroup);
router.post('/:id/messages', authorize, addMessage);

router.post('/:groupId/tasks', authorize, createGroupTask);
router.get('/:groupId/tasks', authorize, getGroupTasks);
router.put('/:groupId/tasks/:taskId', authorize, updateGroupTask);
router.delete('/:groupId/tasks/:taskId', authorize, deleteGroupTask);

router.get('/:id/messages', authorize, getGroupMessages);

export default router;
