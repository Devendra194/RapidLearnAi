import React, { useState } from 'react';
import api from '../../services/api';

export default function StoryResult({ story, onCreateNew }) {
  const [deleting, setDeleting] = useState(false);

  console.log('StoryResult received:', story);

  if (!story || !story.storyId || !story.audioUrl) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8">
        <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Story</h2>
        <p className="text-red-700 mb-4">
          Story data is incomplete. Please try again.
        </p>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Back to Form
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    setDeleting(true);
    try {
      await api.delete(`/audio-story/story/${story.storyId}`);
      alert('Story deleted successfully');
      onCreateNew();
    } catch (error) {
      alert('Failed to delete: ' + error.response?.data?.error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = story.audioUrl;
    a.download = `${story.topic}-story.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: `${story.topic} - AI Audio Story`,
        text: `Listen to an engaging podcast about: ${story.doubt}`,
        url: window.location.href
      });
    } else {
      alert('Share link: ' + window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onCreateNew}
        className="text-blue-600 hover:text-blue-700 font-semibold"
      >
        Create Another Story
      </button>

      {/* Main Audio Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{story.topic}</h2>
        <p className="text-gray-600 mb-6">{story.doubt}</p>

        {/* Audio Player */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <audio
            controls
            className="w-full"
          >
            <source src={story.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <p className="text-sm text-gray-600 mt-3">
            Duration: {story.duration || '~2'} minutes
          </p>
        </div>

        {/* Story Text */}
        {story.aiStory && (
          <details className="bg-gray-50 rounded-lg p-4 mb-6">
            <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
              View Full Story Text
            </summary>
            <p className="text-gray-700 mt-4 whitespace-pre-wrap text-sm">
              {story.aiStory}
            </p>
          </details>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition"
          >
            Download
          </button>

          <button
            onClick={handleShare}
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg transition"
          >
            Share
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-semibold py-2 px-4 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Story Created Successfully</h3>
        <p className="text-sm text-blue-700">
          Your AI-generated podcast is ready to listen!
        </p>
      </div>
    </div>
  );
}