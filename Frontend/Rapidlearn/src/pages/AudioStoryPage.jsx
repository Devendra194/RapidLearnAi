import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import StoryProcessing from '../components/AudioStory/StoryProcessing';
import StoryResult from '../components/AudioStory/StoryResult';
import api from '../services/api';

export default function AudioStoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('form'); // form, processing, result
  const [storyData, setStoryData] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    doubt: '',
    complexity: 'intermediate'
  });
  const [formLoading, setFormLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleCreateStory = async (formDataSubmit) => {
    try {
      setFormLoading(true);
      setCurrentStep('processing');

      const response = await api.post(
        '/audio-story/create-audio-story',
        {
          topic: formDataSubmit.topic,
          doubt: formDataSubmit.doubt,
          complexity: formDataSubmit.complexity
        }
      );

      setStoryData({
        storyId: response.data.storyId,
        topic: formDataSubmit.topic,
        doubt: formDataSubmit.doubt,
        startTime: Date.now()
      });

    } catch (error) {
      console.error('Error creating story:', error);
      alert('Failed to create story: ' + error.response?.data?.error);
      setCurrentStep('form');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStoryComplete = (story) => {
    console.log('handleStoryComplete called with:', story);
    const mergedData = { ...storyData, ...story };
    console.log('Merged story data:', mergedData);
    setStoryData(mergedData);
    setCurrentStep('result');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setStoryData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Audio Story</h1>
          <p className="text-gray-600 mt-2">Turn your questions into engaging podcast stories</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === 'form' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (formData.topic.trim() && formData.doubt.trim()) {
                handleCreateStory(formData);
              }
            }} className="space-y-6">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📚 Topic or Subject
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Photosynthesis, Quantum Computing"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  maxLength={100}
                  disabled={formLoading}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.topic.length}/100 characters</p>
              </div>

              {/* Doubt Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ❓ Your Question or Doubt
                </label>
                <textarea
                  value={formData.doubt}
                  onChange={(e) => setFormData({ ...formData, doubt: e.target.value })}
                  placeholder="What would you like to understand?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  maxLength={300}
                  disabled={formLoading}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.doubt.length}/300 characters</p>
              </div>

              {/* Complexity Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎯 Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, complexity: level.value })}
                      disabled={formLoading}
                      className={`p-3 rounded-lg font-semibold transition ${
                        formData.complexity === level.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formLoading || !formData.topic.trim() || !formData.doubt.trim()}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white text-lg transition ${
                  formLoading || !formData.topic.trim() || !formData.doubt.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {formLoading ? '⏳ Generating...' : '🎙️ Generate Audio Story'}
              </button>
            </form>
          </div>
        )}

        {currentStep === 'processing' && storyData && (
          <StoryProcessing
            storyId={storyData.storyId}
            topic={storyData.topic}
            onComplete={handleStoryComplete}
            onError={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'result' && storyData && (
          <StoryResult
            story={storyData}
            onCreateNew={handleBackToForm}
          />
        )}
      </main>
    </div>
  );
}
