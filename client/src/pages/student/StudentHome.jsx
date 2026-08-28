import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentHeader from '../../components/StudentHeader';
import { 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const StudentHome = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPresentations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/student/presentations');
      setPresentations(res.data);
    } catch (err) {
      console.error('Error loading presentations:', err);
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm mb-8">
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>First Come, First Served</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Available Presentations
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-2xl">
            Select an open presentation below to view available topics and reserve your presentation topic.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Active Presentation Events
          </h2>
          <button
            onClick={fetchPresentations}
            disabled={loading}
            className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* List of Published Presentations */}
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="inline-block w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading available presentations...</p>
          </div>
        ) : presentations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Open Presentations</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              There are currently no presentations open for topic selection. Please check back later or contact your faculty.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {presentations.map((pres) => (
              <div
                key={pres._id}
                className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      {pres.subjectCode}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-500 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {pres.presentationDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {pres.subjectName}
                  </h3>

                  <div className="flex items-center space-x-4 pt-1">
                    <div className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
                      Available Topics: {pres.availableTopics} / {pres.totalTopics}
                    </div>
                  </div>
                </div>

                <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex items-center justify-end">
                  <Link
                    to={`/student/presentation/${pres._id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    View Topics
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

   <footer className="bg-white border-t border-gray-200 py-5">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <p className="text-xs sm:text-sm text-gray-500">
      Designed & Developed by{' '}
      <a
        href="https://www.linkedin.com/company/shreeji-it-solution-pvt-ltd/?viewAsMember=true"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
      >
        Shreeji IT Solution PVT. LTD.
      </a>
    </p>
  </div>
</footer>

    </div>
  );
};

export default StudentHome;
