import React from 'react';
import ToDoList from './ToDoList'; // should be backend-integrated version
import SchedulePlanner from './SchedulePlanner'; // should be backend-integrated version

const WelcomeScreen: React.FC = () => {
  return (
    <div className="bg-dashboard-gradient min-h-screen px-4 py-8 transition-bg">
      <div className="text-center fade-in mb-8">
        <h1 className="text-3xl font-bold text-textLight dark:text-textDark">Welcome to your Dashboard!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Manage your tasks and schedule efficiently.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 card fade-in pop-in">
          <h2 className="text-xl font-semibold mb-4 text-textLight dark:text-textDark">📝 To-Do List</h2>
          <ToDoList />
        </div>

        <div className="flex-1 card fade-in pop-in">
          <h2 className="text-xl font-semibold mb-4 text-textLight dark:text-textDark">📅 Schedule Planner</h2>
          <SchedulePlanner />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
