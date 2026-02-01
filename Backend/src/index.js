// Backend/src/index.js

// Force IPv4 on Windows to prevent DNS resolution issues (OpenRouter)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Always load environment variables from the backend project root (.env next to package.json)
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
});
const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const learningRoutes = require('./routes/learning');
const uploadRoutes = require('./routes/upload');
const videoRoutes = require('./routes/video');
const chatRoutes = require('./routes/chat');
const audioStoryRoutes = require('./routes/audioStory'); // ✨ NEW
const { errorHandler } = require('./middleware/errorHandler');
const { logging } = require('./middleware/logging');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase (side-effect import ensures admin app is ready)
require('./utils/firebaseAdmin');

// Allow both configured frontend URL and common local dev ports
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (e.g curl, Postman) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(logging);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/audio-story', audioStoryRoutes); // ✨ NEW: Audio Story Routes

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Error handler
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  // Point to the Frontend build directory specific to the structure
  app.use(express.static(path.join(__dirname, '../../Frontend/Rapidlearn/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../Frontend/Rapidlearn', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📚 Video Generation: POST /api/learning/create-learning-video`);
  console.log(`🎙️ Audio Story: POST /api/audio-story/create-audio-story`);
});