const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Resolve service account relative to this file so it works regardless of CWD
// Check for environment variable first (Production/Render)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Handle potential escaped newlines in private key if they exist
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable');
    throw error;
  }
} else {
  // Fallback to local file (Development)
  const serviceAccountPath = path.join(
    __dirname,
    "..",
    "config",
    "rapidlearnai-firebase-adminsdk-fbsvc-ca067b0ffa.json"
  );

  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  } else {
    console.warn(`⚠️ Firebase service account not found at ${serviceAccountPath}. Firebase features may fail.`);
  }
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Uses your Realtime Database URL; change here if you use a different instance
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://rapidlearnai-default-rtdb.firebaseio.com",
  });
}

module.exports = admin;
