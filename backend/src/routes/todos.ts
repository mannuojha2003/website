import express from 'express';
import {
  getTodos,
  createTodo,
  toggleTodo,
  deleteTodo,
} from '../controllers/todoController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTodos);
router.post('/', createTodo);
router.patch('/:id/toggle', toggleTodo);
router.delete('/:id', deleteTodo);

export default router;
