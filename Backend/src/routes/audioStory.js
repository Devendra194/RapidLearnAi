const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const audioStoryController = require('../controllers/audioStoryController');

// Create new audio story
router.post('/create-audio-story', authenticate, audioStoryController.createAudioStory);

// Get story by ID (with current status)
router.get('/story/:storyId', authenticate, audioStoryController.getStoryStatus);

// Get all stories for authenticated user
router.get('/stories', authenticate, audioStoryController.getUserStories);

// Delete a story
router.delete('/story/:storyId', authenticate, audioStoryController.deleteStory);

module.exports = router;    