// frontend/src/components/VideoPlayer/SummaryTab.jsx
import React from 'react';

const SummaryTab = ({ chatData }) => {
  const { conceptSummary, topic } = chatData;
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Concept Summary: {topic}</h3>
      {conceptSummary ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-gray-800 whitespace-pre-line">{conceptSummary}</p>
        </div>
      ) : (
        <p className="text-gray-500 italic">No summary available.</p>
      )}
    </div>
  );
};

export default SummaryTab;