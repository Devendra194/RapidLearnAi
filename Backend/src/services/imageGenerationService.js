// HYBRID: Replicate Imagen-4 → Clipdrop → Canvas Fallback

const Replicate = require('replicate');
const axios = require('axios');
const FormData = require('form-data');
const { uploadToCloudinary } = require('./cloudinaryService');

const retryWithBackoff = async (fn, maxRetries = 3, initialDelayMs = 2000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = error.response?.status;

      if (status === 429) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`⏳ Rate limited (429). Waiting ${delayMs}ms before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delayMs = 1000 * Math.pow(2, attempt);
      console.log(`⚠️ Request failed (${status}). Waiting ${delayMs}ms before retry ${attempt + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};


//replicate
const generateImageViaReplicate = async (text, pointId) => {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN is not configured');
  }

  console.log(`🎨 Generating image via Replicate (Google Imagen-4)...`);

  const prompt = `Professional educational illustration about: ${text}. High quality, vector art style, colorful, 16:9 aspect ratio, suitable for online learning platform. Clear and engaging.`;

  return retryWithBackoff(async () => {
    const replicate = new Replicate({
      auth: apiKey,
    });

    // Use google/imagen-4 model
    const output = await replicate.run('google/imagen-4', {
      input: {
        prompt: prompt,
        aspect_ratio: '16:9',
        safety_filter_level: 'block_medium_and_above',
      },
    });

    if (!output || !output.url) {
      throw new Error('No image URL in response');
    }

    console.log(`✅ Replicate generated image: ${output.url()}`);

    // Download the image from the URL
    const imageResponse = await axios.get(output.url(), {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error('Downloaded image is empty');
    }

    return Buffer.from(imageResponse.data);
  });
};


//clipdrop
const generateImageViaClipDrop = async (text, pointId) => {
  const apiKey = process.env.CLIPDROP_API_KEY;
  if (!apiKey) {
    throw new Error('CLIPDROP_API_KEY is not configured');
  }

  console.log(`🎨 Generating image via Clipdrop API...`);

  const prompt = `Professional educational illustration about: ${text}. High quality, vector art style, colorful, 16:9 ratio. Suitable for learning materials. Clear and engaging.`;

  return retryWithBackoff(async () => {
    const form = new FormData();
    form.append('prompt', prompt);

    const response = await axios.post(
      'https://clipdrop-api.co/text-to-image/v1',
      form,
      {
        headers: {
          'x-api-key': apiKey,
          ...form.getHeaders(),
        },
        responseType: 'arraybuffer',
        timeout: 60000,
      }
    );

    console.log(`✅ Clipdrop generated image (${response.data.length} bytes)`);
    return Buffer.from(response.data);
  });
};


//fallback system 2
const generateCanvasImage = async (text, pointId) => {
  try {
    console.log(`🎨 Generating image via Canvas (local fallback)...`);
    const { createCanvas } = require('canvas');

    const canvas = createCanvas(1280, 1440);
    const ctx = canvas.getContext('2d');

    // Gradient background (top half)
    const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);

    // Decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 1280,
        Math.random() * 720,
        80 + Math.random() * 120,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // White section below
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 720, 1280, 720);

    // Separator line
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 740);
    ctx.lineTo(1240, 740);
    ctx.stroke();

    // Learning Point Text
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const maxWidth = 1200;
    const lineHeight = 50;
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    let y = 780;
    for (let textLine of lines) {
      ctx.fillText(textLine, 40, y);
      y += lineHeight;
    }

    // Watermark
    ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('rapidlearnai', 1240, 1420);

    ctx.fillStyle = 'rgba(118, 75, 162, 0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('AI-Powered Learning', 1240, 1395);

    console.log(`✅ Canvas image created`);
    return canvas.toBuffer('image/png');
  } catch (canvasError) {
    console.error(`❌ Canvas creation failed: ${canvasError.message}`);
    throw canvasError;
  }
};


//fallback system 3
const generateImageForPoint = async (text, pointId) => {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🖼️  Generating image for: "${text.slice(0, 50)}..."`);
    console.log(`${'='.repeat(60)}`);

    let imageBuffer = null;
    let source = '';

    // Try 1: Replicate (Imagen-4) - Best quality
    try {
      console.log(`\n[1/3] Trying Replicate (Google Imagen-4)...`);
      imageBuffer = await generateImageViaReplicate(text, pointId);
      source = 'Replicate Imagen-4';
    } catch (replicateError) {
      console.warn(`⚠️ Replicate failed: ${replicateError.message}`);

      // Try 2: Clipdrop - Good quality, fast
      try {
        console.log(`\n[2/3] Trying Clipdrop API...`);
        imageBuffer = await generateImageViaClipDrop(text, pointId);
        source = 'Clipdrop';
      } catch (clipdropError) {
        console.warn(`⚠️ Clipdrop failed: ${clipdropError.message}`);
        if (clipdropError.response?.status === 402) {
          console.warn(`   (Quota exceeded - 402 Payment Required)`);
        }

        // Try 3: Canvas fallback (instant, local)
        console.log(`\n[3/3] Falling back to Canvas...`);
        imageBuffer = await generateCanvasImage(text, pointId);
        source = 'Canvas';
      }
    }

    // Upload to Cloudinary
    console.log(`\n📤 Uploading to Cloudinary (source: ${source})...`);
    const url = await uploadToCloudinary(
      imageBuffer,
      `learning-images/${pointId}`,
      'image'
    );

    console.log(`✅ Image ready (${source}): ${url}\n`);
    return url;

  } catch (error) {
    console.error(`❌ Image generation completely failed: ${error.message}\n`);
    throw error;
  }
};

module.exports = { generateImageForPoint };