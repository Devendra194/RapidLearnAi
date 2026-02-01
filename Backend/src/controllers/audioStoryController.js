const { v4: uuidv4 } = require('uuid');
const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();
const audioStoryService = require('../services/audioStoryService');

/**
 * POST /api/audio-story/create-audio-story
 * Create a new audio story and start async processing
 */
exports.createAudioStory = async (req, res) => {
  try {
    const { topic, doubt, complexity } = req.body;
    const userId = req.user.uid;

    // Validation
    if (!topic || !doubt) {
      return res.status(400).json({ error: 'Topic and doubt are required' });
    }

    if (topic.trim().length === 0 || doubt.trim().length === 0) {
      return res.status(400).json({ error: 'Fields cannot be empty' });
    }

    if (doubt.length > 300) {
      return res.status(400).json({ error: 'Doubt must be under 300 characters' });
    }

    const storyId = uuidv4();
    const now = new Date();

    // Create Firestore document with initial status
    const storyDoc = {
      storyId,
      userId,
      topic: topic.trim(),
      doubt: doubt.trim(),
      complexity: complexity || 'intermediate',
      status: 'processing',
      aiStory: null,
      audioUrl: null,
      duration: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('audioStories').doc(storyId).set(storyDoc);
    console.log(`[AudioStory] Created document: ${storyId}`);

    // Start async processing (fire and forget)
    // Don't await - return immediately to frontend
    audioStoryService.generateStory(storyId, userId, topic.trim(), doubt.trim(), complexity)
      .catch(err => {
        console.error(`[AudioStory] ${storyId} generation failed:`, err.message);
        // Update document with error
        db.collection('audioStories').doc(storyId).update({
          status: 'failed',
          error: err.message || 'Unknown error',
          updatedAt: new Date(),
        }).catch(updateErr => {
          console.error(`[AudioStory] Failed to update error status:`, updateErr.message);
        });
      });

    // Respond immediately (202 Accepted - processing in background)
    res.status(202).json({
      storyId,
      message: 'Story generation started',
      estimatedTime: '1-2 minutes',
    });

  } catch (error) {
    console.error('[AudioStory] Error creating story:', error.message);
    res.status(500).json({ error: 'Failed to create audio story' });
  }
};

/**
 * GET /api/audio-story/story/:storyId
 * Get story status and data
 */
exports.getStoryStatus = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.uid;

    if (!storyId || storyId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    const doc = await db.collection('audioStories').doc(storyId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = doc.data();

    // Verify ownership
    if (story.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Convert Firestore timestamps to ISO strings for JSON serialization
    const storyForClient = {
      ...story,
      createdAt: story.createdAt?.toDate?.() || story.createdAt,
      updatedAt: story.updatedAt?.toDate?.() || story.updatedAt,
    };

    // Return full story data
    res.json(storyForClient);

  } catch (error) {
    console.error('[AudioStory] Error fetching story:', error.message);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
};

/**
 * GET /api/audio-story/stories
 * Get all stories for authenticated user
 */
exports.getUserStories = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('audioStories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const stories = [];
    snapshot.forEach(doc => {
      const story = doc.data();
      // Convert timestamps for JSON serialization
      stories.push({
        ...story,
        createdAt: story.createdAt?.toDate?.() || story.createdAt,
        updatedAt: story.updatedAt?.toDate?.() || story.updatedAt,
      });
    });

    res.json({ 
      stories,
      count: stories.length,
    });

  } catch (error) {
    console.error('[AudioStory] Error fetching user stories:', error.message);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

/**
 * DELETE /api/audio-story/story/:storyId
 * Delete a story and its audio from Cloudinary
 */
exports.deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.uid;

    if (!storyId || storyId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    const doc = await db.collection('audioStories').doc(storyId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = doc.data();

    // Verify ownership
    if (story.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete Firestore document
    await db.collection('audioStories').doc(storyId).delete();
    console.log(`[AudioStory] Deleted: ${storyId}`);

    res.json({ 
      message: 'Story deleted successfully',
      storyId,
    });

  } catch (error) {
    console.error('[AudioStory] Error deleting story:', error.message);
    res.status(500).json({ error: 'Failed to delete story' });
  }
};
