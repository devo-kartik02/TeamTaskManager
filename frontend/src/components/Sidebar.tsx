import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, LogOut, CheckSquare, UserCircle } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || '');
        setUserRole(user.role || '');
      } catch (e) { }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`;

  return (
    <div className="w-64 glass-panel m-4 hidden md:flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-400">
          <img src="/logo.png" alt="TaskMaster Logo" className="w-8 h-8 mr-2 rounded-lg object-cover" />
          TaskMaster
        </h1>
      </div>

      {userName && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center bg-black/10">
          <UserCircle className="w-10 h-10 text-indigo-400 mr-3 opacity-80" />
          <div>
            <p className="text-sm text-slate-400 font-medium">Welcome back,</p>
            <p className="text-slate-100 font-bold truncate">{userName}</p>
            <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">{userRole}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2 mt-2">
        <NavLink to="/dashboard" className={navClasses}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink to="/board" className={navClasses}>
          <KanbanSquare className="w-5 h-5 mr-3 flex-shrink-0" />
          <div className="flex flex-col">
            <span>Kanban Board</span>
            <span className="text-[10px] opacity-70">Visual Task Tracker</span>
          </div>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
