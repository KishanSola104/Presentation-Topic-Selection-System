import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import TeacherSidebar from '../../components/TeacherSidebar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  BookOpen, 
  Lock, 
  FileEdit, 
  Eye, 
  Calendar, 
  AlertCircle, 
  RefreshCw,
  PlusCircle
} from 'lucide-react';

const OpenPresentations = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lockTarget, setLockTarget] = useState(null);
  const [locking, setLocking] = useState(false);

  const fetchOpenPresentations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/presentations/open');
      setPresentations(res.data);
    } catch (err) {
      console.error('Error fetching open presentations:', err);
      setError(err.response?.data?.message || 'Unable to load open presentations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenPresentations();
  }, []);

  const handleConfirmLock = async () => {
    if (!lockTarget) return;
    setLocking(true);
    try {
      await axiosClient.put(`/presentations/${lockTarget._id}/lock`);
      setLockTarget(null);
      await fetchOpenPresentations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock presentation.');
    } finally {
      setLocking(false);
    }
  };

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-green-600" />
              Open Presentations
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Currently published presentations that students can view and select topics for.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOpenPresentations}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/teacher/make-presentation"
              className="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Make Presentation
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm">Loading open presentations...</p>
          </div>
        ) : presentations.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No Open Presentations</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              There are no published presentations active for students right now.
            </p>
            <Link
              to="/teacher/make-presentation"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Presentation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((pres) => (
              <div
                key={pres._id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {pres.subjectCode}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 mt-2 line-clamp-1">
                        {pres.subjectName}
                      </h2>
                    </div>
                    <StatusBadge status={pres.status} />
                  </div>

                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>Presentation Date: {pres.presentationDate}</span>
                  </div>

                  {/* Topic Statistics */}
                  <div className="mt-5 grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-center">
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium">Total Topics</p>
                      <p className="text-base font-bold text-gray-800 mt-0.5">{pres.totalTopics}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-green-700 font-medium">Selected</p>
                      <p className="text-base font-bold text-green-700 mt-0.5">{pres.selectedTopics}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-indigo-700 font-medium">Remaining</p>
                      <p className="text-base font-bold text-indigo-700 mt-0.5">{pres.remainingTopics}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/teacher/presentation/${pres._id}/results`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Results
                  </Link>
                  <Link
                    to={`/teacher/presentation/${pres._id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5 mr-1 text-gray-500" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setLockTarget(pres)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Lock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lock Confirmation Modal */}
        <ConfirmModal
          isOpen={!!lockTarget}
          title="Lock Presentation"
          message={`Are you sure you want to lock "${lockTarget?.subjectName}" (${lockTarget?.subjectCode})? Students will no longer be able to select topics.`}
          confirmText="Lock Presentation"
          confirmVariant="danger"
          loading={locking}
          onConfirm={handleConfirmLock}
          onCancel={() => setLockTarget(null)}
        />
      </div>
    </TeacherSidebar>
  );
};

export default OpenPresentations;
