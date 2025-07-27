import { Request, Response } from 'express';
import Todo from '../models/Todo';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// ✅ Get all todos for the logged-in user
export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.username;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error('Failed to fetch todos:', err);
    res.status(500).json({ error: 'Server error while fetching todos' });
  }
};

// ✅ Add a new todo
export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.username;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Text is required' });

  try {
    const todo = await Todo.create({ user: userId, text, completed: false });
    res.status(201).json(todo);
  } catch (err) {
    console.error('Failed to create todo:', err);
    res.status(500).json({ error: 'Server error while creating todo' });
  }
};

// ✅ Toggle completion status
export const toggleTodo = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.username;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const todo = await Todo.findOne({ _id: id, user: userId });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error('Failed to toggle todo:', err);
    res.status(500).json({ error: 'Server error while toggling todo' });
  }
};

// ✅ Delete a todo
export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.username;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;

  try {
    const deleted = await Todo.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) return res.status(404).json({ error: 'Todo not found' });

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Failed to delete todo:', err);
    res.status(500).json({ error: 'Server error while deleting todo' });
  }
};
