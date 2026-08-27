import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

const TeacherLogin = () => {
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();

  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!teacherId.trim() || !password) {
      setErrorMessage('Please enter both Faculty ID and password.');
      return;
    }

    const result = await login(teacherId, password);
    if (result.success) {
      navigate('/teacher/dashboard');
    } else {
      setErrorMessage(result.message || 'Invalid faculty ID or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-sm">
            <GraduationCap className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Faculty Portal Login
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Sign in to manage presentations and topics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-xl sm:px-10">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty ID
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="e.g. MCA_Teacher"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Student Portal
            </Link>
            <span>Faculty Account Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
