import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentHeader from '../../components/StudentHeader';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Hash, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Clock, 
  Sparkles, 
  BookOpen,
  Check
} from 'lucide-react';

const StudentPresentation = () => {
  const { id } = useParams();

  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const pollingRef = useRef(null);

  const fetchPresentationDetails = async (isBackgroundPoll = false) => {
    if (!isBackgroundPoll) setLoading(true);
    try {
      const res = await axiosClient.get(`/student/presentations/${id}`);
      setPresentation(res.data);

      // If the currently selected topic was taken by someone else in background poll, clear selection
      if (selectedTopicId && res.data.topics) {
        const stillAvailable = res.data.topics.some((t) => t._id === selectedTopicId);
        if (!stillAvailable && !successData) {
          setSelectedTopicId('');
          setError('The topic you had selected was just chosen by another student. Please pick an available topic.');
        }
      }
    } catch (err) {
      console.error('Error loading presentation details:', err);
      if (!isBackgroundPoll) {
        setError(err.response?.data?.message || 'Unable to connect to the server.');
      }
    } finally {
      if (!isBackgroundPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentationDetails();

    // Set up polling interval every 4 seconds for simple real-time topic availability updates
    pollingRef.current = setInterval(() => {
      if (!successData) {
        fetchPresentationDetails(true);
      }
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id, selectedTopicId, successData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!studentName.trim()) {
      setError('Student Name is required.');
      return;
    }
    if (!studentId.trim()) {
      setError('Student ID / Roll Number is required.');
      return;
    }
    if (!selectedTopicId) {
      setError('Please select one presentation topic.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/presentations/${id}/select-topic`, {
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        topicId: selectedTopicId
      });

      // Clear polling
      if (pollingRef.current) clearInterval(pollingRef.current);

      setSuccessData(res.data.selection);
    } catch (err) {
      console.error('Selection failed:', err);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      // Immediately refresh topic list to update taken topics
      fetchPresentationDetails(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to All Presentations
        </Link>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="inline-block w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading presentation details...</p>
          </div>
        ) : !presentation ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">Presentation Not Available</h2>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              This presentation may have been drafted or removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
            >
              Return Home
            </Link>
          </div>
        ) : successData ? (
          /* SUCCESS SCREEN (Requirement 20) */
          <div className="bg-white rounded-2xl border border-green-200 shadow-md p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900">
              Topic Selected Successfully!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your presentation topic has been officially confirmed on a First Come, First Served basis.
            </p>

            <div className="my-8 max-w-md mx-auto bg-gray-50 rounded-xl p-5 border border-gray-200 text-left space-y-3.5">
              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subject:
                </span>
                <span className="text-sm font-bold text-gray-900 text-right">
                  {successData.subjectName} ({successData.subjectCode})
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student Name:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {successData.studentName}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student ID:
                </span>
                <span className="text-sm font-mono font-bold text-gray-900">
                  {successData.studentId}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Your Topic:
                </span>
                <span className="text-sm font-bold text-indigo-700 text-right">
                  Topic {successData.topicNumber}: {successData.topicTitle}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Selection Time:
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {new Date(successData.selectedAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto mb-6 text-xs text-amber-800 font-medium">
              You cannot select another topic for this presentation.
            </div>

            <Link
              to="/"
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : presentation.isLocked ? (
          /* LOCKED SCREEN (Requirement 13) */
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Presentation Locked</h2>
            <p className="text-sm text-red-600 font-medium mt-2">
              This presentation is currently locked. Topic selection is closed.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Faculty has temporarily or permanently closed topic claims for this presentation.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Return to All Presentations
              </Link>
            </div>
          </div>
        ) : (
          /* SELECTION FORM (Requirements 15, 16, 17, 19) */
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {presentation.subjectCode}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {presentation.presentationDate}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {presentation.subjectName}
                  </h1>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 bg-green-50 text-green-800 border border-green-200 rounded-full text-xs font-bold">
                    Available Topics: {presentation.availableCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-sm text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-indigo-600" />
                  Student Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Kishan Solanki"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID / Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 101"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Topic Selection Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                      Select Your Presentation Topic
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Select one topic from the remaining available topics (First Come, First Served).
                    </p>
                  </div>
                </div>

                {presentation.topics.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 font-medium">
                      All topics have been selected by other students.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      No topics are currently available for this presentation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {presentation.topics.map((topic) => {
                      const isSelected = selectedTopicId === topic._id;
                      return (
                        <label
                          key={topic._id}
                          className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="topicSelection"
                            value={topic._id}
                            checked={isSelected}
                            onChange={() => setSelectedTopicId(topic._id)}
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <div className="ml-3 flex-1">
                            <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">
                              Topic {topic.topicNumber}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 block mt-0.5">
                              {topic.title}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="p-1 bg-indigo-600 text-white rounded-full flex-shrink-0 self-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {presentation.topics.length > 0 && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !selectedTopicId}
                    className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Reserving Topic...
                      </span>
                    ) : (
                      'Submit Topic'
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Topic reservation is instant. Duplicate registrations for the same roll number are prohibited.
                  </p>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 mt-auto">
        Presentation Topic Selection System • MCA Department
      </footer>
    </div>
  );
};

export default StudentPresentation;
