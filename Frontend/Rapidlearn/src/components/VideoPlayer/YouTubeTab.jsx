// frontend/src/components/VideoPlayer/YouTubeTab.jsx
import React from 'react';

const YouTubeTab = ({ chatData }) => {
  const { youtubeVideos, topic } = chatData;
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Videos: {topic}</h3>
      {youtubeVideos && youtubeVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {youtubeVideos.map((video, idx) => (
            <a
              key={video.videoId || idx}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border rounded-lg overflow-hidden hover:shadow-md"
            >
              {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover" />}
              <div className="p-3">
                <h4 className="font-medium text-gray-900 line-clamp-2">{video.title}</h4>
                <p className="text-sm text-blue-600 mt-1">Watch on YouTube</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No related videos found.</p>
      )}
    </div>
  );
};

export default YouTubeTab;