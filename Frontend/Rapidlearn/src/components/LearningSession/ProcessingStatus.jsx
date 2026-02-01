// frontend/src/components/LearningSession/ProcessingStatus.jsx
import React, { useEffect, useState } from 'react';
import { getChatStatus } from '../../services/videoAPI';
import { database } from '../../services/firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import VideoTabs from '../VideoPlayer/VideoTabs';

const ProcessingStatus = ({ chatId }) => {
  const [progress, setProgress] = useState({ percent: 0, stage: 'Starting...', error: null });
  const [chatData, setChatData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const progressRef = ref(database, `progress/${chatId}`);
    const unsubscribe = onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProgress(data);
        if (data.error) setProgress((p) => ({ ...p, error: data.error }));
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const poll = async () => {
      try {
        const data = await getChatStatus(chatId);
        setChatData(data);
        if (data.status === 'failed') {
          setProgress((p) => ({ ...p, error: data.error || 'Processing failed' }));
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  if (progress.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <span className="font-medium">Failed:</span> {progress.error}
            </p>
            <button onClick={() => navigate('/learn')} className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (chatData?.status === 'completed') {
    return <VideoTabs chatData={chatData} />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Generating Your Video</h2>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{progress.stage}</span>
          <span>{progress.percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress.percent}%` }}></div>
        </div>
      </div>
      <p className="text-gray-600 text-sm">We’re turning your study material into a smart video lesson. This usually takes 1-3 minutes.</p>
      <div className="mt-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">Don’t close this tab</p>
      </div>
    </div>
  );
};

export default ProcessingStatus;