const express = require('express');
const { mergeVideos, concatenateVideos } = require('../controllers/videoController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// These are internal endpoints
// main flow uses orchestration
//jaan buj ke dala hai fallback ke liye
router.post('/merge', authenticate, mergeVideos);
router.post('/concatenate', authenticate, concatenateVideos);

module.exports = router;