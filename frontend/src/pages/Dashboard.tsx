import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import AddApplicationModal from '../components/AddApplicationModal';
import { Moon, Sun } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const userInfoStr = localStorage.getItem('userInfo');
  const user = userInfoStr ? JSON.parse(userInfoStr) : null;

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <nav className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">Job Tracker</h1>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        
        <div className="flex items-center space-x-4 border-l pl-6 border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{user?.email}</span>
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Applications</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition font-medium"
          >
            + Add Application
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </main>


      <AddApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;