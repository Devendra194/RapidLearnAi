const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../utils/firebaseAdmin');


const db = admin.firestore();

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    
    await db.collection('users').doc(userRecord.uid).set({
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    
    const token = jwt.sign({ uid: userRecord.uid, email }, process.env.JWT_SECRET || 'rapidlearnai-secret', {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { uid: userRecord.uid, email } });

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

   

    const token = jwt.sign({ uid: userRecord.uid, email }, process.env.JWT_SECRET || 'rapidlearnai-secret', {
      expiresIn: '7d',
    });

    res.json({ token, user: { uid: userRecord.uid, email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

const getCurrentUser = (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email });
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { signup, login, getCurrentUser, logout };