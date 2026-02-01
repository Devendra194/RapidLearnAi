const validateCreateLearning = (req, res, next) => {
  const { fileBase64, fileType, topic, userQuery, userId } = req.body;

  if (!fileBase64 || typeof fileBase64 !== 'string') {
    return res.status(400).json({ error: 'Valid base64 file required' });
  }
  if (!fileType || !['application/pdf', 'image/jpeg', 'image/png'].includes(fileType)) {
    return res.status(400).json({ error: 'Unsupported file type' });
  }
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Valid topic required' });
  }
  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
    return res.status(400).json({ error: 'Valid query required' });
  }
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid user ID required' });
  }

  next();
};

module.exports = { validateCreateLearning };