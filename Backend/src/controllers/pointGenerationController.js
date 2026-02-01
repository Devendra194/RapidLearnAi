const { generateLearningPoints, searchYouTubeVideos } = require('../services/pointGenerationService');

const generatePoints = async (req, res) => {
  try {
    const { topic, userQuery } = req.body;
    const points = await generateLearningPoints(topic, userQuery);
    res.json({ points });
  } catch (error) {
    console.error('Point generation error:', error);
    res.status(500).json({ error: 'Failed to generate learning points' });
  }
};

const getYoutubeVideos = async (req, res) => {
  try {
    const { topic } = req.body;
    const videos = await searchYouTubeVideos(topic);
    res.json({ videos });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube videos' });
  }
};

module.exports = { generatePoints, getYoutubeVideos };