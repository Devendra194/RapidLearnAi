import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function StoryProcessing({ storyId, topic, onComplete, onError }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting...');
  const [error, setError] = useState(null);

  const stages = [
    { stage: 'Generating story', percent: 20 },
    { stage: 'Creating audio narration', percent: 50 },
    { stage: 'Uploading to cloud', percent: 80 },
    { stage: 'Finalizing', percent: 100 }
  ];

  useEffect(() => {
    let progressInterval;
    let storyCheckInterval;
    let progressValue = 10;

    // Simulate progress increment while processing
    const incrementProgress = () => {
      progressValue += Math.random() * 15;
      if (progressValue > 85) progressValue = 85;
      setProgress(Math.floor(progressValue));
    };

    // Check story status periodically
    const checkStoryStatus = async () => {
      try {
        console.log('Polling story:', storyId);

        const { data } = await api.get(`/audio-story/story/${storyId}`);

        console.log('Story status response:', data);
        console.log('Status:', data.status);
        console.log('Audio URL:', data.audioUrl);
        setStatus(data.status);

        if (data.status === 'completed' && data.audioUrl) {
          console.log('✅ Story completed with audio URL, calling onComplete with:', data);
          setProgress(100);
          clearInterval(progressInterval);
          clearInterval(storyCheckInterval);
          setTimeout(() => onComplete(data), 500);
        } else if (data.status === 'completed' && !data.audioUrl) {
          console.warn('⚠️ Status is completed but audioUrl is missing:', data);
        } else if (data.status === 'failed') {
          console.error('❌ Story generation failed:', data.error);
          setError(data.error || 'An error occurred');
          setProgress(0);
          clearInterval(progressInterval);
          clearInterval(storyCheckInterval);
          onError();
        } else {
          console.log('⏳ Still processing... status:', data.status);
        }
      } catch (error) {
        console.error('❌ Error fetching story status:', error.response?.data || error.message);
        // Continue polling even if fetch fails
      }
    };

    // Start polling
    progressInterval = setInterval(incrementProgress, 800);
    storyCheckInterval = setInterval(checkStoryStatus, 1500); // Changed from 2000 to 1500ms for faster detection

    // Initial check
    checkStoryStatus();

    return () => {
      clearInterval(progressInterval);
      clearInterval(storyCheckInterval);
    };
  }, [storyId, onComplete, onError]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Generating Your Audio Story</h2>
      
      {/* Progress Bar Section */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          <span className="font-semibold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6">We're turning your question into an engaging podcast story. This usually takes 30-40 seconds.</p>
      
      {/* Loading Indicator */}
      <div className="mt-8 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-3 text-gray-600 text-sm">Don't close this tab</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Failed:</span> {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
