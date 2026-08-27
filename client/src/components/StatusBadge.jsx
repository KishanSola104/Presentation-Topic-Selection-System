import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = () => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'locked':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'draft':
      default:
        return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  const getLabel = () => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'Published';
      case 'locked':
        return 'Locked';
      case 'draft':
      default:
        return 'Draft';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass()}`}>
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
        status === 'published' ? 'bg-green-500' : status === 'locked' ? 'bg-red-500' : 'bg-amber-500'
      }`}></span>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
