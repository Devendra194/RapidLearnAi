// frontend/src/pages/LearningPage.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FileUpload from '../components/LearningSession/FileUpload';
import QueryInput from '../components/LearningSession/QueryInput';
import ProcessingStatus from '../components/LearningSession/ProcessingStatus';

const LearningPage = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(!!chatId);
  const navigate = useNavigate();

  const handleStartProcessing = (newChatId) => {
    setIsProcessing(true);
    navigate(`/learn?chatId=${newChatId}`);
  };

  if (isProcessing && chatId) {
    return <ProcessingStatus chatId={chatId} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Your Learning Video</h1>
        <p className="mt-2 text-gray-600">
          Upload study material and ask a question — we’ll turn it into a smart video lesson.
        </p>
      </div>
      <FileUpload onFileSelect={setFile} />
      <QueryInput
        topic={topic}
        setTopic={setTopic}
        userQuery={userQuery}
        setUserQuery={setUserQuery}
        file={file}
        onStartProcessing={handleStartProcessing}
      />
    </div>
  );
};

export default LearningPage;