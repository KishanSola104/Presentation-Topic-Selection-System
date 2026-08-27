import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  BookOpen, 
  Lock, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherSidebar = ({ children }) => {
  const { teacher, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Make Presentation', path: '/teacher/make-presentation', icon: FilePlus },
    { name: 'Open Presentation', path: '/teacher/open-presentations', icon: BookOpen },
    { name: 'Lock Presentation', path: '/teacher/locked-presentations', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600 rounded text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Faculty Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand / Header */}
          <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">Faculty Portal</h1>
              <p className="text-xs text-gray-500 font-medium">{teacher?.name || 'Jonita Mam'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">Logged in as:</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{teacher?.teacherId || 'MCA_Teacher'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default TeacherSidebar;
