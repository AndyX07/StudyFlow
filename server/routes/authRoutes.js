import express from 'express';
import { authorize } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, logoutUser, getCurUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authorize, getCurUser);

export default router;
