import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import TeacherSidebar from '../../components/TeacherSidebar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Lock, 
  Unlock, 
  Eye, 
  Calendar, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

const LockedPresentations = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  const fetchLockedPresentations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/presentations/locked');
      setPresentations(res.data);
    } catch (err) {
      console.error('Error fetching locked presentations:', err);
      setError(err.response?.data?.message || 'Unable to load locked presentations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockedPresentations();
  }, []);

  const handleConfirmUnlock = async () => {
    if (!unlockTarget) return;
    setUnlocking(true);
    try {
      await axiosClient.put(`/presentations/${unlockTarget._id}/unlock`);
      setUnlockTarget(null);
      await fetchLockedPresentations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock presentation.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-red-600" />
              Locked Presentations
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Presentations where topic selection has been closed. Faculty can unlock to reopen selection.
            </p>
          </div>

          <button
            onClick={fetchLockedPresentations}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors self-start sm:self-auto"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
            <p className="text-sm">Loading locked presentations...</p>
          </div>
        ) : presentations.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No Locked Presentations</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are currently no locked presentations.
            </p>
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
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
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
                      <p className="text-[11px] text-gray-500 font-medium">Remaining</p>
                      <p className="text-base font-bold text-gray-800 mt-0.5">{pres.remainingTopics}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/teacher/presentation/${pres._id}/results`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View Results
                  </Link>

                  <button
                    type="button"
                    onClick={() => setUnlockTarget(pres)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5 mr-1.5" />
                    Unlock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unlock Confirmation Modal */}
        <ConfirmModal
          isOpen={!!unlockTarget}
          title="Unlock Presentation"
          message={`Are you sure you want to unlock "${unlockTarget?.subjectName}" (${unlockTarget?.subjectCode})? Students will be able to select available topics again.`}
          confirmText="Unlock Presentation"
          confirmVariant="primary"
          loading={unlocking}
          onConfirm={handleConfirmUnlock}
          onCancel={() => setUnlockTarget(null)}
        />
      </div>
    </TeacherSidebar>
  );
};

export default LockedPresentations;
