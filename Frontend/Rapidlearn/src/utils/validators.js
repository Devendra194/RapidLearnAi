// frontend/src/utils/validators.js
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from './constants';

export const validateFile = (file) => {
  if (!file) return 'File is required';
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return 'Unsupported file type. Use PDF, JPG, or PNG.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Max size is 50MB.';
  }
  return null;
};

export const validateQuery = (query) => {
  if (!query || !query.trim()) return 'Query is required';
  if (query.length > 500) return 'Query must be under 500 characters';
  return null;
};

export const validateTopic = (topic) => {
  if (!topic || !topic.trim()) return 'Topic is required';
  if (topic.length > 100) return 'Topic must be under 100 characters';
  return null;
};