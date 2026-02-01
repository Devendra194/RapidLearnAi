// frontend/src/components/LearningSession/QueryInput.jsx
import React, { useState } from 'react';
import { createLearningSession } from '../../services/videoAPI';
import useAuth from '../../hooks/useAuth';

const QueryInput = ({ topic, setTopic, userQuery, setUserQuery, file, onStartProcessing }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !topic.trim() || !userQuery.trim()) {
      setError('Please fill all fields and upload a file.');
      return;
    }
    if (!user) {
      setError('Please sign in to start a learning session.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      const payload = {
        fileBase64: base64,
        fileType: file.type,
        topic: topic.trim(),
        userQuery: userQuery.trim(),
        userId: user.uid,
      };
      const res = await createLearningSession(payload);
      onStartProcessing(res.chatId);
    } catch (err) {
      setError('Failed to start processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Atomic Fusion"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Learning Question</label>
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Explain this concept like I'm 15..."
            rows="3"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">{userQuery.length}/500</div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
            loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Starting...' : 'Generate Learning Video'}
        </button>
      </form>
    </div>
  );
};

export default QueryInput;