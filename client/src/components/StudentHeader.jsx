import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, UserCheck } from 'lucide-react';

const StudentHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base md:text-lg block leading-tight">
              Presentation Topic Portal
            </span>
            <span className="text-xs text-gray-500 font-medium">Topic Selection System</span>
          </div>
        </Link>

        <Link
          to="/teacher/login"
          className="inline-flex items-center text-xs md:text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
        >
          <UserCheck className="w-4 h-4 mr-1.5 text-gray-500" />
          Faculty Login
        </Link>
      </div>
    </header>
  );
};

export default StudentHeader;
