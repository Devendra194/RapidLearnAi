const { uploadToCloudinary } = require('../services/cloudinaryService');

const uploadFile = async (req, res) => {
  try {
    if (!req.body.fileBase64) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const buffer = Buffer.from(req.body.fileBase64, 'base64');
    const url = await uploadToCloudinary(buffer, 'uploads');

    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

module.exports = { uploadFile };