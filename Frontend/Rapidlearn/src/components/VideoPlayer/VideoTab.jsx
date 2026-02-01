// frontend/src/components/VideoPlayer/VideoTab.jsx
import React from 'react';
import LearningPointCard from './LearningPointCard';

const VideoTab = ({ chatData }) => {
  const { finalVideoUrl, points = [], topic } = chatData;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your AI Learning Video: {topic}</h3>
        {finalVideoUrl ? (
          <div className="relative pt-[56.25%]">
            <video
              src={finalVideoUrl}
              controls
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
            />
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">Video not available</p>
          </div>
        )}
        {finalVideoUrl && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => window.open(finalVideoUrl, '_blank')}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              Download
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Share Link
            </button>
          </div>
        )}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Learning Points</h4>
        {points.length > 0 ? (
          <div className="space-y-4">
            {points.map((point, idx) => (
              <LearningPointCard key={point.pointId || idx} point={point} index={idx + 1} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No learning points generated yet.</p>
        )}
      </div>
    </div>
  );
};

export default VideoTab;


