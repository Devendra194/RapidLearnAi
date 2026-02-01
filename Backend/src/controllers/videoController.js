const { mergeImageAndAudio } = require('../services/videoMergingService');

const mergeVideos = async (req, res) => {
  try {
    const { imageUrl, audioUrl, pointId, chatId } = req.body;
    const videoUrl = await mergeImageAndAudio(imageUrl, audioUrl, pointId, chatId);
    res.json({ videoUrl });
  } catch (error) {
    console.error('Video merge error:', error);
    res.status(500).json({ error: 'Failed to merge video' });
  }
};

const concatenateVideos = async (req, res) => {
  try {
    const { videoUrls, chatId } = req.body;
    const finalUrl = await mergeAllVideos(videoUrls, chatId);
    res.json({ finalVideoUrl: finalUrl });
  } catch (error) {
    console.error('Video concatenation error:', error);
    res.status(500).json({ error: 'Failed to concatenate videos' });
  }
};


const { mergeAllVideos } = require('../services/videoMergingService');

module.exports = { mergeVideos, concatenateVideos };