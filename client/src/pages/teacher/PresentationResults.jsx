import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import TeacherSidebar from '../../components/TeacherSidebar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { exportResultsToPdf } from '../../utils/exportPdf';
import { exportResultsToExcel } from '../../utils/exportExcel';
import { exportResultsToXml } from '../../utils/exportXml';
import { 
  ArrowLeft, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Users,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

const PresentationResults = () => {
  const { id } = useParams();

  const [presentation, setPresentation] = useState(null);
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Release modal state
  const [releaseTarget, setReleaseTarget] = useState(null);
  const [releasing, setReleasing] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get(`/presentations/${id}/selections`);
      setPresentation(res.data.presentation);
      setSelections(res.data.selections || []);
    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.response?.data?.message || 'Failed to load presentation results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [id]);

  const handleConfirmRelease = async () => {
    if (!releaseTarget) return;
    setReleasing(true);
    setError('');
    setSuccessMsg('');
    try {
      await axiosClient.delete(`/selections/${releaseTarget._id}`);
      setSuccessMsg(`Successfully released topic "${releaseTarget.topicTitle}". It is now available for selection again.`);
      setReleaseTarget(null);
      await fetchResults();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release topic.');
    } finally {
      setReleasing(false);
    }
  };

  const handleExportPdf = () => {
    if (!presentation) return;
    exportResultsToPdf(presentation, selections);
  };

  const handleExportExcel = () => {
    if (!presentation) return;
    exportResultsToExcel(presentation, selections);
  };

  const handleExportXml = () => {
    if (!presentation) return;
    exportResultsToXml(presentation, selections);
  };

  if (loading) {
    return (
      <TeacherSidebar>
        <div className="p-12 text-center text-gray-500">
          <div className="inline-block w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Loading presentation results...</p>
        </div>
      </TeacherSidebar>
    );
  }

  if (!presentation) {
    return (
      <TeacherSidebar>
        <div className="p-8 bg-white rounded-xl border border-gray-200 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Presentation Not Found</h2>
          <Link
            to="/teacher/dashboard"
            className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Return to Dashboard
          </Link>
        </div>
      </TeacherSidebar>
    );
  }

  return (
    <TeacherSidebar>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/teacher/open-presentations"
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              title="Back to Open Presentations"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-bold text-gray-900">Presentation Results</h1>
                <StatusBadge status={presentation.status} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Student topic selection records and export tools
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Export as PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-red-600" />
              Export PDF
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Export as Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-green-600" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={handleExportXml}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              title="Export as XML Spreadsheet"
            >
              <Code className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Export XML
            </button>
            <button
              type="button"
              onClick={fetchResults}
              className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh results"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 text-sm text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Presentation Metadata & Summary Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {presentation.subjectCode}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-xs font-medium text-gray-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {presentation.presentationDate}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{presentation.subjectName}</h2>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Topics</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{presentation.totalTopics}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 font-medium">Selected</p>
                <p className="text-xl font-bold text-green-700 mt-0.5">{presentation.selectedTopics}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-700 font-medium">Remaining</p>
                <p className="text-xl font-bold text-indigo-700 mt-0.5">{presentation.remainingTopics}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-600" />
              Student Selections ({selections.length})
            </h3>
            <span className="text-xs text-gray-500">FCFS Order</span>
          </div>

          {selections.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-900">No Selections Yet</h4>
              <p className="text-xs text-gray-500 mt-1">
                Students have not claimed any topics for this presentation yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3">#</th>
                    <th scope="col" className="px-6 py-3">Student Name</th>
                    <th scope="col" className="px-6 py-3">Student ID</th>
                    <th scope="col" className="px-6 py-3">Selected Topic</th>
                    <th scope="col" className="px-6 py-3">Selection Time</th>
                    <th scope="col" className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selections.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {item.studentName}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-mono whitespace-nowrap">
                        {item.studentId}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                        {item.topicTitle}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {item.selectedAt
                          ? new Date(item.selectedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setReleaseTarget(item)}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Release
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Release Topic Confirmation Modal */}
        <ConfirmModal
          isOpen={!!releaseTarget}
          title="Release Topic Selection"
          message={`Are you sure you want to release topic "${releaseTarget?.topicTitle}" claimed by ${releaseTarget?.studentName} (${releaseTarget?.studentId})? This will remove the selection and make the topic available to other students again.`}
          confirmText="Release Topic"
          confirmVariant="danger"
          loading={releasing}
          onConfirm={handleConfirmRelease}
          onCancel={() => setReleaseTarget(null)}
        />
      </div>
    </TeacherSidebar>
  );
};

export default PresentationResults;
