// frontend/src/components/VideoPlayer/VideoTabs.jsx
import React, { useState } from 'react';
import VideoTab from './VideoTab.jsx';
import SummaryTab from './SummaryTab';
import YouTubeTab from './YouTubeTab';

const VideoTabs = ({ chatData }) => {
  const [activeTab, setActiveTab] = useState('video');

  const tabs = [
    { id: 'video', label: 'Video Lesson' },
    { id: 'summary', label: 'Concept Summary' },
    { id: 'youtube', label: 'More Resources' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'video' && <VideoTab chatData={chatData} />}
        {activeTab === 'summary' && <SummaryTab chatData={chatData} />}
        {activeTab === 'youtube' && <YouTubeTab chatData={chatData} />}
      </div>
    </div>
  );
};

export default VideoTabs;