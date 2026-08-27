import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import TeacherSidebar from '../../components/TeacherSidebar';
import { FilePlus, AlertCircle, Calendar, Hash, Book, Code } from 'lucide-react';

const MakePresentation = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    presentationDate: '',
    numberOfTopics: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      subjectCode: '',
      subjectName: '',
      presentationDate: '',
      numberOfTopics: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.subjectCode.trim()) {
      setError('Subject Code is required.');
      return;
    }
    if (!formData.subjectName.trim()) {
      setError('Subject Name is required.');
      return;
    }
    if (!formData.presentationDate) {
      setError('Presentation Selection Date is required.');
      return;
    }
    const topicCount = parseInt(formData.numberOfTopics, 10);
    if (!formData.numberOfTopics || isNaN(topicCount) || topicCount <= 0) {
      setError('Number of topics is required and must be greater than zero.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post('/presentations', {
        subjectCode: formData.subjectCode.trim(),
        subjectName: formData.subjectName.trim(),
        presentationDate: formData.presentationDate,
        numberOfTopics: topicCount
      });

      const newPresentation = response.data;
      navigate(`/teacher/presentation/${newPresentation._id}`);
    } catch (err) {
      console.error('Failed to create presentation:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherSidebar>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FilePlus className="w-6 h-6 mr-2 text-indigo-600" />
            Make Presentation
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a new presentation topic event. Topics can be added and drafted before publishing.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Code className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  placeholder="e.g. MCA-302"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Subject Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Book className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleChange}
                  placeholder="e.g. Web Technology"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Presentation Selection Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presentation Selection Date <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  name="presentationDate"
                  value={formData.presentationDate}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Number of Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Topics <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  name="numberOfTopics"
                  min="1"
                  max="100"
                  value={formData.numberOfTopics}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Initial number of topic slots to generate. You can add or edit topics later.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                )}
                Create Presentation
              </button>
            </div>
          </form>
        </div>
      </div>
    </TeacherSidebar>
  );
};

export default MakePresentation;
