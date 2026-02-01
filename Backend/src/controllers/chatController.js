const admin = require('../utils/firebaseAdmin');

const db = admin.firestore();

const getUserChats = async (req, res) => {
  try {
    const userId = req.user.uid;

    let snapshot;
    try {
      // Preferred query: filtered + ordered for most recent sessions
      snapshot = await db
        .collection('chats')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
    } catch (err) {
      // Firestore may require a composite index for where+orderBy; if missing, fall back
      if (err.code === 9 /* FAILED_PRECONDITION: missing index */) {
        console.warn('[getUserChats] Missing index for userId+createdAt, falling back without orderBy');
        snapshot = await db
          .collection('chats')
          .where('userId', '==', userId)
          .limit(20)
          .get();
      } else {
        throw err;
      }
    }

    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ chats });
  } catch (error) {
    console.error('getUserChats error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

module.exports = { getUserChats };