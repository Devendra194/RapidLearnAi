const jwt = require('jsonwebtoken');
const admin = require('../utils/firebaseAdmin');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    
    try {
      const firebaseUser = await admin.auth().verifyIdToken(token);
      req.user = { uid: firebaseUser.uid, email: firebaseUser.email || firebaseUser.email_verified };
      return next();
    } catch (firebaseError) {
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rapidlearnai-secret');
        req.user = { uid: decoded.uid, email: decoded.email };
        return next();
      } catch (jwtError) {
        console.error('Auth error (JWT + Firebase failed):', firebaseError, jwtError);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };