import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Code, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  Plus, 
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

const BulkImportModal = ({ 
  isOpen, 
  onClose, 
  onApply, 
  maxAllowedTopics = 10, 
  currentTopicsCount = 0 
}) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file'
  const [textInput, setTextInput] = useState('');
  const [parsedTopics, setParsedTopics] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [importMode, setImportMode] = useState('replace'); // 'replace' | 'append'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  // Clean and parse text lines
  const getTopicsFromText = (text) => {
    return text
      .split('\n')
      .map((line) => line.trim().replace(/^Topic\s*\d+[\s:\-.]*/i, '').replace(/^\d+[\s:\-.)]*/, '').trim())
      .filter((line) => line.length > 0);
  };

  // CSV Parser
  const parseCsvFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          // Try parsing with XLSX first for robust quoting/encoding support
          const workbook = XLSX.read(content, { type: 'string' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          const extracted = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            
            // Check if first row is header
            if (i === 0) {
              const firstVal = String(row[0] || '').toLowerCase().trim();
              if (firstVal === 'topic' || firstVal === 'topic title' || firstVal === 'title' || firstVal === 'topics' || firstVal === 'topic_title' || firstVal === '#' || firstVal === 'topic number') {
                if (row.length > 1) {
                  const secondVal = String(row[1] || '').toLowerCase().trim();
                  if (secondVal.includes('title') || secondVal.includes('topic')) {
                    continue;
                  }
                }
                continue;
              }
            }

            // Extract topic title (could be row[1] if row[0] is index, or row[0])
            let title = '';
            if (row.length >= 2 && !isNaN(parseInt(row[0], 10))) {
              title = String(row[1] || '').trim();
            } else {
              title = String(row[0] || '').trim();
            }

            if (title) {
              title = title.replace(/^Topic\s*\d+[\s:\-.]*/i, '').replace(/^\d+[\s:\-.)]*/, '').trim();
              if (title) extracted.push(title);
            }
          }
          resolve(extracted);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file.'));
      reader.readAsText(file);
    });
  };

  // XML Parser
  const parseXmlFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'text/xml');

          const parseError = xmlDoc.getElementsByTagName('parsererror');
          if (parseError.length > 0) {
            return reject(new Error('Invalid XML syntax. Please check your XML file formatting.'));
          }

          const extracted = [];

          // Try various common tag names: <title>, <topic>, <item>, <name>
          const titleNodes = xmlDoc.getElementsByTagName('title');
          if (titleNodes.length > 0) {
            for (let i = 0; i < titleNodes.length; i++) {
              const val = titleNodes[i].textContent.trim();
              if (val) extracted.push(val);
            }
          } else {
            const topicNodes = xmlDoc.getElementsByTagName('topic');
            if (topicNodes.length > 0) {
              for (let i = 0; i < topicNodes.length; i++) {
                const val = topicNodes[i].textContent.trim();
                if (val) extracted.push(val);
              }
            } else {
              const itemNodes = xmlDoc.getElementsByTagName('item');
              for (let i = 0; i < itemNodes.length; i++) {
                const val = itemNodes[i].textContent.trim();
                if (val) extracted.push(val);
              }
            }
          }

          const cleaned = extracted
            .map((t) => t.replace(/^Topic\s*\d+[\s:\-.]*/i, '').replace(/^\d+[\s:\-.)]*/, '').trim())
            .filter((t) => t.length > 0);

          resolve(cleaned);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read XML file.'));
      reader.readAsText(file);
    });
  };

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setSelectedFileName(file.name);

    const fileName = file.name.toLowerCase();
    try {
      let topics = [];
      if (fileName.endsWith('.xml')) {
        topics = await parseXmlFile(file);
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        topics = await parseCsvFile(file);
      } else {
        setError('Unsupported file type. Please upload a .csv, .xml, or .txt file.');
        return;
      }

      if (topics.length === 0) {
        setError('No topics found in the uploaded file. Please verify the file format.');
        return;
      }

      setParsedTopics(topics);
      setSuccess(`Successfully parsed ${topics.length} topic${topics.length > 1 ? 's' : ''} from ${file.name}.`);
    } catch (err) {
      console.error('File parsing error:', err);
      setError(err.message || 'Failed to parse file.');
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const sample = `Topic Number,Topic Title\n1,Introduction to Cloud Computing\n2,Microservices Architecture & Docker\n3,GraphQL vs RESTful API Design\n4,Cybersecurity Best Practices in Web Apps\n5,Machine Learning Pipelines with Python\n`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_presentation_topics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Sample XML
  const handleDownloadSampleXml = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<topics>
  <topic>
    <title>Introduction to Cloud Computing</title>
  </topic>
  <topic>
    <title>Microservices Architecture and Docker</title>
  </topic>
  <topic>
    <title>GraphQL vs RESTful API Design</title>
  </topic>
  <topic>
    <title>Cybersecurity Best Practices in Web Apps</title>
  </topic>
  <topic>
    <title>Machine Learning Pipelines with Python</title>
  </topic>
</topics>`;
    const blob = new Blob([sample], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_presentation_topics.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Submit and apply topics
  const handleApply = () => {
    setError('');

    let topicsToApply = [];
    if (activeTab === 'text') {
      topicsToApply = getTopicsFromText(textInput);
    } else {
      topicsToApply = parsedTopics;
    }

    if (topicsToApply.length === 0) {
      setError('Please enter or import at least one topic title.');
      return;
    }

    // Validation: Check <= maxAllowedTopics
    let targetCount = topicsToApply.length;
    if (importMode === 'append') {
      targetCount += currentTopicsCount;
    }

    if (targetCount > maxAllowedTopics) {
      setError(
        `Cannot add ${topicsToApply.length} topic${topicsToApply.length > 1 ? 's' : ''}. Total topics would be ${targetCount}, which exceeds the presentation limit of ${maxAllowedTopics}.`
      );
      return;
    }

    onApply(topicsToApply, importMode);
    onClose();
  };

  const currentCount = activeTab === 'text' ? getTopicsFromText(textInput).length : parsedTopics.length;
  const isOverLimit = currentCount > maxAllowedTopics;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Layers className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Bulk Add / Import Topics</h3>
              <p className="text-xs text-indigo-200">
                Add multiple topics or import from CSV/XML (Max: {maxAllowedTopics} topics)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setError('');
            }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Enter / Paste Topics</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('file');
              setError('');
            }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import CSV / XML File</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Error & Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2.5 text-xs text-green-700">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: Enter / Paste Topics */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Topic Titles (Enter one topic per line)
                </label>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isOverLimit
                      ? 'bg-red-100 text-red-700'
                      : currentCount > 0
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-400'
                  }`}
                >
                  {currentCount} / {maxAllowedTopics} topics
                </span>
              </div>

              <textarea
                rows={7}
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setError('');
                }}
                placeholder="Introduction to Artificial Intelligence&#10;Blockchain and Smart Contracts&#10;Quantum Computing Fundamentals&#10;Cloud Native Microservices"
                className="w-full p-3 border border-gray-300 rounded-xl text-sm font-sans placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              <p className="text-[11px] text-gray-500">
                Tip: You can paste a list from Word, Excel, or Google Docs. Numbering (e.g. &quot;1.&quot;, &quot;Topic 1:&quot;) will be automatically formatted.
              </p>
            </div>
          )}

          {/* TAB 2: Import from File */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div className="border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50/40 rounded-xl p-6 text-center transition-colors">
                <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">
                  Click or drag CSV or XML file here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .csv, .xml, and .txt files
                </p>

                <input
                  type="file"
                  accept=".csv,.xml,.txt,text/csv,application/xml,text/xml"
                  onChange={handleFileUpload}
                  className="mt-3 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              {/* Sample Download Tools */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs text-gray-600 font-medium flex items-center">
                  <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Need sample formats?
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                  >
                    <FileSpreadsheet className="w-3 h-3 mr-1" />
                    Sample CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleXml}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                  >
                    <Code className="w-3 h-3 mr-1" />
                    Sample XML
                  </button>
                </div>
              </div>

              {/* Preview of Parsed Topics */}
              {parsedTopics.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">
                      Parsed Topics Preview ({parsedTopics.length}):
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isOverLimit ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {parsedTopics.length} / {maxAllowedTopics} topics
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2.5 bg-gray-50 divide-y divide-gray-200 text-xs">
                    {parsedTopics.map((title, idx) => (
                      <div key={idx} className="py-1 flex items-center space-x-2">
                        <span className="font-mono text-gray-400 w-6">#{idx + 1}</span>
                        <span className="text-gray-800 font-medium flex-1">{title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Mode Selection */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Placement Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`p-2.5 rounded-lg border flex items-center cursor-pointer transition-colors ${
                  importMode === 'replace'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Fill / Replace Presentation Topics</span>
              </label>

              <label
                className={`p-2.5 rounded-lg border flex items-center cursor-pointer transition-colors ${
                  importMode === 'append'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="mr-2 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Append to Existing Topics</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Limit: Max <strong>{maxAllowedTopics}</strong> topics allowed
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={currentCount === 0 || isOverLimit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Apply {currentCount > 0 ? `(${currentCount})` : ''} Topics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
