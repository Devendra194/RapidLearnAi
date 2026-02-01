import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import char1 from '../images/char1.jpg';
import char2 from '../images/char2.jpg';
import char3 from '../images/char3.jpg';
import char4 from '../images/char4.jpg';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Character 1 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Transform Study Materials into AI Learning Videos
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Upload a PDF or image, ask a question, and get a professional educational video in minutes.
            </p>
            <Link
              to="/learn"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Your First Video
            </Link>
          </div>
          <div className="flex justify-center">
            <img 
              src={char1} 
              alt="Students ready to learn"
              className="w-full max-w-md h-auto"
            />
          </div>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Large Feature Card - Upload (spans 6 cols, 2 rows) */}
          <div className="md:col-span-6 md:row-span-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-between h-full">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Upload Any Material</h3>
              <p className="text-gray-600 text-base">PDFs, lecture slides, textbook scans, handwritten notes, or any learning material you have.</p>
              
              <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <p className="text-gray-600 text-sm">Works with any file format and size</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <p className="text-gray-600 text-sm">Instantly extract text from images</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <p className="text-gray-600 text-sm">Support for multiple languages</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-600 font-medium mt-4">Fast & Reliable Processing</div>
          </div>

          {/* Feature Card - AI Explanation (spans 3 cols) */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Explanation</h3>
              <p className="text-gray-600 text-sm">Get clear, student-friendly explanations with visuals and examples.</p>
            </div>
          </div>

          {/* Feature Card - Watch & Learn (spans 3 cols) */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Watch & Learn</h3>
              <p className="text-gray-600 text-sm">Receive a polished 1-2 minute video plus curated YouTube resources.</p>
            </div>
          </div>

          {/* Wide Feature - Get Results Fast (spans 6 cols) */}
          <div className="md:col-span-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Results in Minutes</h3>
              <p className="text-gray-600">Professional-quality videos created faster than traditional tutoring methods. Perfect for test prep or concept review.</p>
            </div>
            <div className="text-sm text-blue-600 font-medium mt-4">Lightning-fast processing</div>
          </div>

          {/* Character - Studying (spans 6 cols) */}
          <div className="md:col-span-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-8 flex items-center justify-center min-h-[250px]">
            <img 
              src={char2} 
              alt="Students studying together"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          {/* Feature Card - Interactive Practice (spans 3 cols) */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Practice</h3>
              <p className="text-gray-600 text-sm">Solve problems step-by-step with instant feedback and detailed solutions.</p>
            </div>
          </div>

          {/* Feature Card - Progress Tracking (spans 3 cols) */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor your learning journey with detailed analytics and achievement milestones.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Videos Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">See Our AI in Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <video 
              src="https://res.cloudinary.com/dn6hxdzj9/video/upload/v1765974511/rapidlearnai/e9dd9576-518e-459e-ab56-d6a03190d61a/rktppzbf4ypcn8glfng1.mp4"
              controls
              className="w-full h-auto bg-gray-900"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600">Sample AI-generated educational video 1</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <video 
              src="https://res.cloudinary.com/dn6hxdzj9/video/upload/v1765980357/rapidlearnai/2c4264f9-b06c-4cdb-98c9-02c6f64a5dac/d7cibpfs2ohxxv2h5djv.mp4"
              controls
              className="w-full h-auto bg-gray-900"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600">Sample AI-generated educational video 2</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <video 
              src="https://res.cloudinary.com/dn6hxdzj9/video/upload/v1766471700/rapidlearnai/2d260ddc-2420-4f2d-acda-fd2c08d4666c/kgu7ugl4wmtiaczizrge.mp4"
              controls
              className="w-full h-auto bg-gray-900"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600">Sample AI-generated educational video 3</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <video 
              src="https://res.cloudinary.com/dn6hxdzj9/video/upload/v1765956161/rapidlearnai/65c038e7-8ed3-48a1-8cfe-6d359d3eeaa3/poeefpuiynikcdxdo9ls.mp4"
              controls
              className="w-full h-auto bg-gray-900"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600">Sample AI-generated educational video 4</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section with Character */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <img 
              src={char4}
              alt="Students studying together"
              className="w-full max-w-md h-auto"
            />
          </div>
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                    <span className="text-blue-600 font-semibold">1</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Your Materials</h3>
                  <p className="mt-2 text-gray-600">Share any study material - PDFs, notes, slides, or images</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                    <span className="text-green-600 font-semibold">2</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ask Your Question</h3>
                  <p className="mt-2 text-gray-600">Tell us what you want to learn about or clarify</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                    <span className="text-purple-600 font-semibold">3</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Get Your Video</h3>
                  <p className="mt-2 text-gray-600">Receive a polished educational video in minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Section with Character */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose RapidLearn?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Unlike generic AI tools, we're built specifically for students who need fast, accurate study content.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-xl">→</span>
                <div>
                  <p className="text-gray-900 font-semibold">AI-Powered Video Generation</p>
                  <p className="text-gray-600 text-sm">Creates engaging videos tailored to your learning style</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-xl">→</span>
                <div>
                  <p className="text-gray-900 font-semibold">Multi-Source Learning</p>
                  <p className="text-gray-600 text-sm">Combines your materials with curated resources for better understanding</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-xl">→</span>
                <div>
                  <p className="text-gray-900 font-semibold">Instant Explanations</p>
                  <p className="text-gray-600 text-sm">Get clear answers without spending hours searching</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-xl">→</span>
                <div>
                  <p className="text-gray-900 font-semibold">Concept-Based Learning</p>
                  <p className="text-gray-600 text-sm">Focus on understanding topics, not just memorizing</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src={char3} 
              alt="Students celebrating success"
              className="w-full max-w-md h-auto"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to transform your learning?</h2>
          <p className="text-gray-600 mb-8 text-lg">Start creating your first AI-powered video today. No credit card required.</p>
          <Link
            to="/learn"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;