import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Task {
  _id: string;
  text: string;
  completed: boolean;
}

const ToDoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const { isAuthenticated } = useAuth();

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/todos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = Array.isArray(res.data) ? res.data : []; // ✅ Defensive check
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch todos', err);
      setTasks([]); // ✅ Prevent tasks from being undefined
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated]);

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/todos',
        { text: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([res.data, ...tasks]);
      setNewTask('');
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `/api/todos/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <button onClick={addTask} className="button-primary">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task._id}
              className={`flex justify-between items-center px-4 py-2 border rounded transition-all
                ${task.completed ? 'bg-green-100 dark:bg-green-900 line-through' : 'bg-white dark:bg-gray-800'}`}
            >
              <span
                onClick={() => toggleComplete(task._id)}
                className="cursor-pointer flex-1"
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task._id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500 dark:text-gray-400 italic">No tasks found.</li>
        )}
      </ul>
    </div>
  );
};

export default ToDoList;
