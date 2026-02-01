const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');

const extractText = async (fileBase64, mimeType) => {
  try {
    const buffer = Buffer.from(fileBase64, 'base64');

    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (['image/jpeg', 'image/png'].includes(mimeType)) {
      const result = await Tesseract.recognize(buffer, 'eng', {
        logger: info => {},
      });
      return result.data.text;
    } else {
      throw new Error('Unsupported file type for OCR');
    }
  } catch (error) {
    console.error('OCR failed:', error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

module.exports = { extractText };
