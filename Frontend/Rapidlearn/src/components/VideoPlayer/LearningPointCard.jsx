// frontend/src/components/VideoPlayer/LearningPointCard.jsx
import React, { useState } from 'react';

const LearningPointCard = ({ point, index }) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play();
        setAudioPlaying(true);
        audioRef.current.onended = () => setAudioPlaying(false);
      }
    }
  };

  const handlePlayVideo = () => {
    if (point.videoUrl) {
      window.open(point.videoUrl, '_blank');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-700">{index}</span>
          </div>
          <div>
            <p className="text-gray-800">{point.text || 'Processing...'}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getStatusColor(point.status)}`}>
              {point.status}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center space-x-3">
        {point.imageUrl && <img src={point.imageUrl} alt={`Visual for point ${index}`} className="w-16 h-16 object-cover rounded border" />}
        <div className="flex space-x-2">
          {point.audioUrl && (
            <button onClick={handlePlayAudio} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {audioPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 010 12m-4.5-9.5L12 3l4.5 4.5M12 2v20" />
                )}
              </svg>
              {audioPlaying ? 'Pause' : 'Play'}
            </button>
          )}
          {point.videoUrl && (
            <button onClick={handlePlayVideo} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 012.5 2.5v0a2.5 2.5 0 01-2.5 2.5H9V10z" />
              </svg>
              Watch Clip
            </button>
          )}
        </div>
      </div>
      {point.audioUrl && <audio ref={audioRef} src={point.audioUrl} preload="none" />}
    </div>
  );
};

export default LearningPointCard;