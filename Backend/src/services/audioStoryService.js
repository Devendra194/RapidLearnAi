const axios = require('axios');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { uploadAudio } = require('../utils/cloudinaryConfig');
const admin = require('../utils/firebaseAdmin');
const db = admin.firestore();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/**
 * Main orchestration function for audio story generation
 * Manages all stages: story generation → TTS → upload → completion
 */
exports.generateStory = async (storyId, userId, topic, doubt, complexity) => {
  const startTime = Date.now();
  
  try {
    console.log(`[AudioStory ${storyId}] ▶️  Starting generation pipeline...`);

    // STAGE 1: Generate story using LLM
    console.log(`[AudioStory ${storyId}] Stage 1/4: Generating story content...`);
    const aiStory = await generateStoryWithLLM(topic, doubt, complexity);
    
    if (!aiStory || aiStory.trim().length === 0) {
      throw new Error('Empty story generated');
    }

    console.log(`[AudioStory ${storyId}] ✓ Story generated (${aiStory.length} chars)`);

    // Update Firestore with generated story
    await db.collection('audioStories').doc(storyId).update({
      aiStory,
      updatedAt: new Date(),
    });

    // STAGE 2: Generate audio narration
    console.log(`[AudioStory ${storyId}] Stage 2/4: Generating audio narration...`);
    const audioBuffer = await generateAudioNarration(aiStory);
    
    console.log(`[AudioStory ${storyId}] ✓ Audio generated (${(audioBuffer.length / 1024).toFixed(2)} KB)`);

    // STAGE 3: Upload to Cloudinary
    console.log(`[AudioStory ${storyId}] Stage 3/4: Uploading to cloud storage...`);
    const audioUrl = await uploadAudioToCloud(audioBuffer, storyId);
    
    console.log(`[AudioStory ${storyId}] ✓ Uploaded: ${audioUrl}`);

    // Calculate duration (rough estimate)
    const estimatedDuration = Math.round((audioBuffer.length / 24000) * 8);

    // STAGE 4: Mark as completed
    console.log(`[AudioStory ${storyId}] Stage 4/4: Finalizing...`);
    await db.collection('audioStories').doc(storyId).update({
      status: 'completed',
      audioUrl,
      duration: estimatedDuration,
      updatedAt: new Date(),
    });

    const totalTime = Date.now() - startTime;
    console.log(`[AudioStory ${storyId}] ✅ COMPLETED in ${(totalTime / 1000).toFixed(2)}s`);

    return { storyId, audioUrl, duration: estimatedDuration };

  } catch (error) {
    console.error(`[AudioStory ${storyId}] ❌ ERROR:`, error.message);
    throw error;
  }
};

/**
 * STAGE 1: Generate story using OpenRouter LLM
 * Returns a 250-300 word narrative story (1.5-2 min when read)
 */
async function generateStoryWithLLM(topic, doubt, complexity) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const systemPrompt = `You are an expert educator creating engaging podcast stories to help students understand complex concepts.

IMPORTANT RULES:
- Create a SHORT STORY (NOT A LECTURE) - exactly 1.5-2 minutes when read aloud
- Use a conversational, engaging tone
- Include real-world analogies and examples
- Avoid technical jargon; explain simply
- Structure: Hook (10s) → Story with explanation (70s) → Real-world example (30s) → Conclusion (10s)
- Word count: 250-300 words (reads in ~1.5-2 minutes at 150 wpm)
- Add [PAUSE] markers every 30-40 words for natural pacing
- Make it memorable and engaging, NOT boring or textbook-like
- OUTPUT ONLY the story text, nothing else`;

      const userPrompt = `Topic: ${topic}
Student's Doubt: ${doubt}
Difficulty Level: ${complexity}

Create an engaging 1.5-2 minute podcast story that helps them understand this concept. Use storytelling, not lectures.`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-r1-distill-qwen-32b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'RapidLearnAI',
          },
          timeout: 60000,
        }
      );

      const story = response.data.choices[0]?.message?.content?.trim();

      if (!story) {
        throw new Error('Empty response from LLM');
      }

      return story;

    } catch (error) {
      retries++;
      console.warn(`[LLM] Attempt ${retries}/${maxRetries} failed:`, error.message);

      if (error.response?.status === 429) {
        // Rate limited - exponential backoff
        const waitMs = Math.pow(2, retries) * 2000;
        console.log(`[LLM] Rate limited, waiting ${waitMs}ms...`);
        await sleep(waitMs);
      } else if (retries >= maxRetries) {
        throw new Error(`LLM failed after ${maxRetries} retries: ${error.message}`);
      } else {
        await sleep(1000);
      }
    }
  }
}

/**
 * STAGE 2: Generate audio narration using ElevenLabs TTS
 * Returns MP3 audio buffer
 */
async function generateAudioNarration(story) {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.warn('[TTS] API key not found, generating silence fallback');
      return generateSilenceWAV(2000); // 2 second silence
    }

    const client = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY,
    });

    // Rachel voice ID (professional, clear voice)
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    // Generate audio stream using correct API
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: story,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    });

    // Convert Fetch ReadableStream to buffer
    const chunks = [];
    const reader = audioStream.getReader();

    let result = await reader.read();
    while (!result.done) {
      chunks.push(Buffer.from(result.value));
      result = await reader.read();
    }

    const audioBuffer = Buffer.concat(chunks);

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Generated audio is empty');
    }

    console.log(`[TTS] Generated ${audioBuffer.length} bytes of audio`);
    return audioBuffer;

  } catch (error) {
    console.error('[TTS] Error:', error.message);

    // Graceful fallback for auth errors
    if (error.message.includes('401') || error.message.includes('403')) {
      console.warn('[TTS] Auth failed, using silence fallback');
      return generateSilenceWAV(2000);
    }

    throw new Error(`TTS failed: ${error.message}`);
  }
}

/**
 * STAGE 3: Upload audio to Cloudinary
 * Uses your existing uploadAudio function from cloudinaryConfig.js
 */
async function uploadAudioToCloud(audioBuffer, storyId) {
  try {
    const folder = `rapidlearnai/audio-stories/${storyId}`;

    // Use your existing Cloudinary upload function
    const audioUrl = await uploadAudio(audioBuffer, {
      folder,
      public_id: `story-${storyId}`,
    });

    return audioUrl;

  } catch (error) {
    console.error('[Upload] Cloudinary error:', error.message);
    throw new Error(`Upload to cloud failed: ${error.message}`);
  }
}

/**
 * Fallback: Generate silent WAV file
 * Used if TTS API is unavailable
 */
function generateSilenceWAV(durationMs) {
  const sampleRate = 44100;
  const channels = 1;
  const bytesPerSample = 2;
  const samples = (sampleRate * durationMs) / 1000;

  const buffer = Buffer.alloc(44 + samples * bytesPerSample);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples * bytesPerSample, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample * channels, 28);
  buffer.writeUInt16LE(bytesPerSample * channels, 32);
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples * bytesPerSample, 40);

  // Data section is silence (all zeros)
  return buffer;
}

/**
 * Utility: Sleep function for delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}