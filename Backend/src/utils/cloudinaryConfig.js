// Backend/src/utils/cloudinaryConfig.js

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Universal upload function for all media types
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} folder - Cloudinary folder path (e.g., 'rapidlearnai/videos')
 * @param {string} resourceType - 'auto' | 'image' | 'video' | 'raw'
 * @returns {Promise<string>} Secure URL of uploaded file
 */
const uploadToCloudinary = async (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to readable stream and pipe
    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Upload image specifically
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options { folder, public_id, ... }
 * @returns {Promise<string>} Secure URL
 */
const uploadImage = async (buffer, options = {}) => {
  return uploadToCloudinary(buffer, options.folder || 'rapidlearnai/images', 'image');
};

/**
 * Upload audio/video file
 * @param {Buffer} buffer - Audio/video buffer
 * @param {Object} options - Upload options { folder, public_id, ... }
 * @returns {Promise<string>} Secure URL
 */
const uploadAudio = async (buffer, options = {}) => {
  return uploadToCloudinary(
    buffer,
    options.folder || 'rapidlearnai/audio',
    options.resourceType || 'video' // Cloudinary treats audio as 'video' resource
  );
};

/**
 * Upload video file
 * @param {Buffer} buffer - Video buffer
 * @param {Object} options - Upload options { folder, public_id, ... }
 * @returns {Promise<string>} Secure URL
 */
const uploadVideo = async (buffer, options = {}) => {
  return uploadToCloudinary(
    buffer,
    options.folder || 'rapidlearnai/videos',
    'video'
  );
};

/**
 * Delete file from Cloudinary by URL
 * @param {string} fileUrl - Cloudinary secure URL
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
  try {
    // Extract public_id from URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/public_id.ext
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1]; // e.g., "public_id.mp3"
    const fileNameWithoutExt = fileName.split('.')[0]; // e.g., "public_id"
    
    // Find folder path
    const uploadIndex = urlParts.indexOf('upload');
    const folderPath = urlParts.slice(uploadIndex + 2).slice(0, -1).join('/'); // e.g., "folder"
    
    const publicId = folderPath ? `${folderPath}/${fileNameWithoutExt}` : fileNameWithoutExt;

    await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Deleted: ${publicId}`);
  } catch (error) {
    console.warn(`[Cloudinary] Delete failed (non-critical):`, error.message);
    // Don't throw - deletion is optional/cleanup operation
  }
};

module.exports = {
  uploadToCloudinary, // Universal upload
  uploadImage,        // Convenience function for images
  uploadAudio,        // Convenience function for audio
  uploadVideo,        // Convenience function for videos
  deleteFile,         // Delete by URL
};