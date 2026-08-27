import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import TeacherSidebar from '../../components/TeacherSidebar';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { 
  FolderKanban, 
  BookOpen, 
  Lock, 
  FileEdit, 
  Eye, 
  PlusCircle, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

const TeacherDashboard = () => {
  const { teacher } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, locked: 0, draft: 0 });
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, presRes] = await Promise.all([
        axiosClient.get('/presentations/stats'),
        axiosClient.get('/presentations')
      ]);
      setStats(statsRes.data);
      setPresentations(presRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {teacher?.name || 'Jonita Mam'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of presentation allocations and topic statuses.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/teacher/make-presentation"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Make Presentation
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Presentations */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Presentations
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">All created</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          {/* Open Presentations */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                Open Presentations
              </p>
              <p className="text-2xl font-bold text-green-700 mt-1">{stats.open}</p>
              <p className="text-xs text-gray-500 mt-1">Published for students</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          {/* Locked Presentations */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                Locked Presentations
              </p>
              <p className="text-2xl font-bold text-red-700 mt-1">{stats.locked}</p>
              <p className="text-xs text-gray-500 mt-1">Selection closed</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
          </div>

          {/* Draft Presentations */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Draft Presentations
              </p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{stats.draft}</p>
              <p className="text-xs text-gray-500 mt-1">Under preparation</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <FileEdit className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Presentations Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Presentations</h2>
            <span className="text-xs text-gray-500">{presentations.length} total entries</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm">Loading presentations...</p>
            </div>
          ) : presentations.length === 0 ? (
            <div className="p-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900">No presentations created yet</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Get started by creating your first presentation event.
              </p>
              <Link
                to="/teacher/make-presentation"
                className="inline-flex items-center px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Make Presentation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3">Subject Code</th>
                    <th scope="col" className="px-6 py-3">Subject Name</th>
                    <th scope="col" className="px-6 py-3">Presentation Date</th>
                    <th scope="col" className="px-6 py-3 text-center">Topics</th>
                    <th scope="col" className="px-6 py-3 text-center">Selected</th>
                    <th scope="col" className="px-6 py-3 text-center">Remaining</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presentations.map((pres) => (
                    <tr key={pres._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {pres.subjectCode}
                      </td>
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {pres.subjectName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {pres.presentationDate}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-800 whitespace-nowrap">
                        {pres.totalTopics}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-green-700 whitespace-nowrap">
                        {pres.selectedTopics}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-indigo-700 whitespace-nowrap">
                        {pres.remainingTopics}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={pres.status} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        {pres.status !== 'draft' && (
                          <Link
                            to={`/teacher/presentation/${pres._id}/results`}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Results
                          </Link>
                        )}
                        <Link
                          to={`/teacher/presentation/${pres._id}`}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <FileEdit className="w-3.5 h-3.5 mr-1 text-gray-500" />
                          {pres.status === 'draft' ? 'Edit Draft' : 'Manage'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherSidebar>
  );
};

export default TeacherDashboard;
