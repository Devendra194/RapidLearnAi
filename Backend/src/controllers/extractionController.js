// This is handled in orchestration; controller not directly exposed
// Keeping for modularity

const { extractText } = require('../services/ocrService');

const extractTextFromFile = async (req, res) => {
  try {
    const { fileBase64, fileType } = req.body;
    const text = await extractText(fileBase64, fileType);
    res.json({ text: text.substring(0, 2000) });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Text extraction failed' });
  }
};

module.exports = { extractTextFromFile };