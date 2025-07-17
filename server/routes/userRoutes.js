import express from 'express';
import { getUser} from '../controllers/userController.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', authorize, getUser);


export default router;