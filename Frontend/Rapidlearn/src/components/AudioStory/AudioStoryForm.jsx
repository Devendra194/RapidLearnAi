import React, { useState } from 'react';

export default function AudioStoryForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    topic: '',
    doubt: '',
    complexity: 'intermediate'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim() || !formData.doubt.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.doubt.length > 300) {
      alert('Doubt must be under 300 characters');
      return;
    }

    setLoading(true);
    await onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Topic Input */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">
            Learning Topic
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g., Newton's Third Law, Photosynthesis"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.topic.length}/100</p>
        </div>

        {/* Doubt Input */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-2">
            What Don't You Understand?
          </label>
          <textarea
            name="doubt"
            value={formData.doubt}
            onChange={handleChange}
            placeholder="Describe what you're confused about..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition resize-none"
            rows={4}
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.doubt.length}/300</p>
        </div>

        {/* Complexity Level */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            {['easy', 'intermediate', 'advanced'].map(level => (
              <label
                key={level}
                className={`relative flex items-center cursor-pointer p-4 border-2 rounded-lg transition ${
                  formData.complexity === level
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="complexity"
                  value={level}
                  checked={formData.complexity === level}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="capitalize font-medium text-gray-700">
                  {level === 'easy' && 'Basic'}
                  {level === 'intermediate' && 'Normal'}
                  {level === 'advanced' && 'Advanced'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {loading ? 'Generating Story...' : 'Generate My Story'}
        </button>

        <p className="text-xs text-center text-gray-500">
          Processing takes 1-2 minutes. Keep this page open.
        </p>
      </form>
    </div>
  );
}
