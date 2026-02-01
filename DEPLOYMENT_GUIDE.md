# Deployment Guide for Render

This project is configured to be deployed as a **single web service** on Render (Backend serving Frontend).

## 1. Preparation
1. Ensure all your changes are committed and pushed to your GitHub repository.
2. Note down the values from your `Backend/.env` file. You will need them.

## 2. Deploy to Render
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.

## 3. Configuration
Use the following settings for the Web Service:

| Setting | Value |
| :--- | :--- |
| **Name** | `rapidlearn-app` (or your choice) |
| **Region** | Choose the one closest to you |
| **Branch** | `main` (or your working branch) |
| **Root Directory** | `.` (Leave empty) |
| **Runtime** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

## 4. Environment Variables
Scroll down to the **Environment Variables** section and click **Add Environment Variable**. You must add ALL variables from your `Backend/.env` file here.

Common variables you likely need:
- `FIREBASE_SERVICE_ACCOUNT` (IMPORTANT: The **content** of your `rapidlearnai-firebase-adminsdk-fbsvc-ca067b0ffa.json` file. Copy the entire JSON content and paste it as the value).
- `MONGO_URI` (Your MongoDB connection string)
- `JWT_SECRET`
- `OPENROUTER_API_KEY`
- `ELEVENLABS_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS` (If using Google Cloud, see note below*)
- `REPLICATE_API_TOKEN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Note:** `PORT` is set automatically by Render, you don't need to add it.
**Note:** `NODE_ENV` will be set to `production` automatically.

## 5. Finish
Click **Create Web Service**. Render will:
1. Clone your repo.
2. Run `npm run build` (Install dependencies for Backend & Frontend, then build Frontend).
3. Run `npm start` (Start the Backend server).

If successful, your app will be live at the URL provided by Render (e.g., `https://rapidlearn.onrender.com`).

---

### * Note on Google Credentials (if applicable)
If you are using `GOOGLE_APPLICATION_CREDENTIALS` pointing to a JSON file:
1. Convert the JSON file content to a base64 string or just paste the raw JSON content into a variable (e.g., `GOOGLE_CREDENTIALS_JSON`).
2. Update your code to read from this variable, OR write a generic build script to write it to a file. 
   *(If you haven't set this up yet, let me know and I can help adjust the code to handle JSON credentials from env vars).*
