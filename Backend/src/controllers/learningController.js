const { v4: uuidv4 } = require('uuid');
const  admin  = require('../utils/firebaseAdmin');
const { processLearningVideo } = require('../services/videoAssemblyService');

const db = admin.firestore();

const createLearningVideo = async (req, res) => {
  try {
    const { fileBase64, fileType, topic, userQuery, userId } = req.body;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(fileType)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const chatId = uuidv4();
    const chatRef = db.collection('chats').doc(chatId);

    await chatRef.set({
      chatId,
      userId,
      topic,
      userQuery,
      status: 'processing',
      extractedText: '',
      summary: '',
      conceptSummary: '',
      youtubeVideos: [],
      points: [],
      finalVideoUrl: '',
      error: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    processLearningVideo(chatId, fileBase64, fileType, topic, userQuery)
      .catch(err => {
        console.error('Background processing failed:', err);
        chatRef.update({
          status: 'failed',
          error: err.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

    res.status(202).json({ chatId, message: 'Processing started' });

  } catch (error) {
    console.error('createLearningVideo error:', error);
    res.status(500).json({ error: 'Failed to start processing' });
  }
};

const getChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.uid;

    const doc = await db.collection('chats').doc(chatId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const data = doc.data();
    if (data.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { fileBase64, ...safeData } = data;
    res.json(safeData);

  } catch (error) {
    console.error('getChatStatus error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
};

module.exports = { createLearningVideo, getChatStatus };