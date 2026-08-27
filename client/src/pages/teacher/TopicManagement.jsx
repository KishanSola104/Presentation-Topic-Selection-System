import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import TeacherSidebar from '../../components/TeacherSidebar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Eye, 
  Calendar, 
  BookOpen, 
  Hash, 
  Code 
} from 'lucide-react';

const TopicManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [presentation, setPresentation] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable presentation details
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [presentationDate, setPresentationDate] = useState('');

  // Modal states
  const [deleteTopicTarget, setDeleteTopicTarget] = useState(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  const fetchPresentationData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get(`/presentations/${id}`);
      setPresentation(res.data);
      setSubjectCode(res.data.subjectCode || '');
      setSubjectName(res.data.subjectName || '');
      setPresentationDate(res.data.presentationDate || '');
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error('Error fetching presentation:', err);
      setError(err.response?.data?.message || 'Failed to load presentation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentationData();
  }, [id]);

  const handleTopicTitleChange = (index, value) => {
    const updated = [...topics];
    updated[index].title = value;
    setTopics(updated);
  };

  const handleAddTopic = () => {
    const nextNumber = topics.length + 1;
    setTopics([
      ...topics,
      {
        topicNumber: nextNumber,
        title: '',
        status: 'available'
      }
    ]);
  };

  const handleDeleteTopicClick = (topic, index) => {
    if (topic.status === 'selected') {
      setError('Cannot delete a topic that has already been selected by a student. Release the topic first.');
      return;
    }
    setDeleteTopicTarget({ topic, index });
  };

  const handleConfirmDeleteTopic = async () => {
    if (!deleteTopicTarget) return;
    const { topic, index } = deleteTopicTarget;

    // If topic is already saved in DB
    if (topic._id) {
      setIsDeletingTopic(true);
      try {
        await axiosClient.delete(`/topics/${topic._id}`);
        // Refresh full presentation
        await fetchPresentationData();
        setSuccessMsg('Topic deleted successfully.');
        setDeleteTopicTarget(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete topic.');
      } finally {
        setIsDeletingTopic(false);
      }
    } else {
      // Local unsaved topic
      const filtered = topics.filter((_, i) => i !== index);
      const reindexed = filtered.map((t, idx) => ({ ...t, topicNumber: idx + 1 }));
      setTopics(reindexed);
      setDeleteTopicTarget(null);
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      // Update presentation info
      await axiosClient.put(`/presentations/${id}`, {
        subjectCode: subjectCode.trim(),
        subjectName: subjectName.trim(),
        presentationDate: presentationDate.trim(),
        numberOfTopics: topics.length
      });

      // Save topics
      const topicRes = await axiosClient.post(`/presentations/${id}/topics`, {
        topics
      });

      setTopics(topicRes.data.topics);
      setSuccessMsg('Draft saved successfully! You can return later to continue.');
      await fetchPresentationData();
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setError('');
    setSuccessMsg('');

    // Pre-check
    if (!subjectCode.trim() || !subjectName.trim() || !presentationDate) {
      setError('Subject Code, Subject Name, and Presentation Date are required.');
      return;
    }

    if (topics.length === 0) {
      setError('Please add at least one topic before publishing.');
      return;
    }

    const emptyIdx = topics.findIndex((t) => !t.title || !t.title.trim());
    if (emptyIdx !== -1) {
      setError(`Topic ${emptyIdx + 1} title is empty. All topic titles must be filled before publishing.`);
      return;
    }

    setPublishing(true);
    try {
      // 1. Save all details and topics first
      await axiosClient.put(`/presentations/${id}`, {
        subjectCode: subjectCode.trim(),
        subjectName: subjectName.trim(),
        presentationDate: presentationDate.trim(),
        numberOfTopics: topics.length
      });

      await axiosClient.post(`/presentations/${id}/topics`, { topics });

      // 2. Publish presentation
      await axiosClient.put(`/presentations/${id}/publish`);

      setSuccessMsg('Presentation published successfully! Students can now view and claim topics.');
      await fetchPresentationData();
    } catch (err) {
      console.error('Error publishing presentation:', err);
      setError(err.response?.data?.message || 'Failed to publish presentation.');
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleLock = async () => {
    if (!presentation) return;
    setError('');
    setSuccessMsg('');
    const action = presentation.status === 'locked' ? 'unlock' : 'lock';
    try {
      await axiosClient.put(`/presentations/${id}/${action}`);
      setSuccessMsg(`Presentation ${action === 'lock' ? 'locked' : 'unlocked'} successfully.`);
      await fetchPresentationData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} presentation.`);
    }
  };

  if (loading) {
    return (
      <TeacherSidebar>
        <div className="p-12 text-center text-gray-500">
          <div className="inline-block w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Loading presentation details...</p>
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

  const isLocked = presentation.status === 'locked';

  return (
    <TeacherSidebar>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/teacher/dashboard"
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-bold text-gray-900">Topic Management</h1>
                <StatusBadge status={presentation.status} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage subject details and topic titles
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {presentation.status !== 'draft' && (
              <Link
                to={`/teacher/presentation/${presentation._id}/results`}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View Results
              </Link>
            )}

            {presentation.status !== 'draft' && (
              <button
                type="button"
                onClick={handleToggleLock}
                className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  isLocked
                    ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                    : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 mr-1.5" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    Lock
                  </>
                )}
              </button>
            )}
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

        {isLocked && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-3 text-sm text-amber-800">
            <Lock className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>
              This presentation is currently locked. To edit topics or subject details, click <strong>Unlock</strong> above.
            </span>
          </div>
        )}

        {/* Presentation Metadata Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
            Presentation Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="e.g. MCA-302"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Web Technology"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Presentation Date
              </label>
              <input
                type="date"
                disabled={isLocked}
                value={presentationDate}
                onChange={(e) => setPresentationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Topics List Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center">
                <Hash className="w-4 h-4 mr-2 text-indigo-600" />
                Topics ({topics.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in the title for each presentation topic
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddTopic}
              disabled={isLocked}
              className="inline-flex items-center px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Topic
            </button>
          </div>

          <div className="space-y-3">
            {topics.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No topics added yet. Click &quot;Add Topic&quot; to add topic slots.
              </p>
            ) : (
              topics.map((topic, index) => (
                <div
                  key={topic._id || `temp-${index}`}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="w-20 text-xs font-bold text-gray-600 flex-shrink-0">
                    Topic {topic.topicNumber || index + 1}
                  </span>

                  <input
                    type="text"
                    disabled={isLocked}
                    value={topic.title || ''}
                    onChange={(e) => handleTopicTitleChange(index, e.target.value)}
                    placeholder={`Enter title for Topic ${topic.topicNumber || index + 1}...`}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />

                  {topic.status === 'selected' ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 flex-shrink-0">
                      Selected
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 flex-shrink-0">
                      Available
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={isLocked || topic.status === 'selected'}
                    onClick={() => handleDeleteTopicClick(topic, index)}
                    title={
                      topic.status === 'selected'
                        ? 'Cannot delete selected topic'
                        : 'Delete topic'
                    }
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddTopic}
              disabled={isLocked}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add More Topic
            </button>

            <div className="w-full sm:w-auto flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLocked || saving || publishing}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 border border-indigo-200 text-sm font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isLocked || saving || publishing}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4 mr-1.5" />
                {publishing ? 'Publishing...' : 'Publish Presentation'}
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteTopicTarget}
          title="Delete Topic"
          message={`Are you sure you want to delete Topic ${deleteTopicTarget?.topic?.topicNumber || ''}? This action cannot be undone.`}
          confirmText="Delete Topic"
          confirmVariant="danger"
          loading={isDeletingTopic}
          onConfirm={handleConfirmDeleteTopic}
          onCancel={() => setDeleteTopicTarget(null)}
        />
      </div>
    </TeacherSidebar>
  );
};

export default TopicManagement;
