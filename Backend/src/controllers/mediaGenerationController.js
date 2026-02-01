const { generateMediaForPoint } = require('../services/mediaGenerationService');

const generateMedia = async (req, res) => {
  try {
    const { text, pointId, chatId } = req.body;
    const media = await generateMediaForPoint(text, pointId, chatId);
    res.json(media);
  } catch (error) {
    console.error('Media generation error:', error);
    res.status(500).json({ error: 'Failed to generate media' });
  }
};

module.exports = { generateMedia };