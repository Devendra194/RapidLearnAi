// Using ElevenLabs SDK (Official library)

const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const { uploadToCloudinary } = require('./cloudinaryService');

// Generate valid WAV silence (44.1kHz, 16-bit, mono, 2 seconds)

//direct documentation se padh ke uthaya haii
const generateSilenceWAV = () => {
  const sampleRate = 44100;
  const duration = 2;
  const channels = 1;
  const bitsPerSample = 16;
  const numSamples = sampleRate * duration * channels;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = numSamples * (bitsPerSample / 8);

  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Fill with zeros (silence)
  for (let i = 44; i < buffer.length; i++) {
    buffer[i] = 0;
  }
  
  return buffer;
};


const generateAudioViaElevenLabs = async (text, pointId) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  console.log(`🎙️  Generating audio via ElevenLabs SDK...`);

  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });

    // Rachel voice ID
    //free mein rachel haii 
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';

    // Generate audio stream
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      modelId: 'eleven_multilingual_v2', // Better model
      outputFormat: 'mp3_44100_128',
    });

    // Convert stream to buffer
    const chunks = [];
    const reader = audio.getReader();
    
    let result = await reader.read();
    while (!result.done) {
      chunks.push(Buffer.from(result.value));
      result = await reader.read();
    }

    const audioBuffer = Buffer.concat(chunks);

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Generated audio is empty');
    }

    console.log(`✅ ElevenLabs generated audio (${audioBuffer.length} bytes)`);
    return audioBuffer;

  } catch (error) {
    console.error(`❌ ElevenLabs SDK error: ${error.message}`);
    throw error;
  }
};

const generateAudioForPoint = async (text, pointId, chatId) => {
  try {
    console.log(`📢 Generating audio for: "${text.slice(0, 40)}..."`);

    // Generate audio using ElevenLabs SDK
    const audioBuffer = await generateAudioViaElevenLabs(text, pointId);

    // Upload to Cloudinary
    const url = await uploadToCloudinary(
      audioBuffer,
      `learning-audio/${pointId}`,
      'raw'
    );

    console.log(`✅ Audio uploaded: ${url}`);
    return url;

  } catch (error) {
    console.error(`❌ ElevenLabs failed: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error(`\n   💡 API Key Error - Check your ELEVENLABS_API_KEY`);
    }

    // Fallback: Use silence WAV
    console.log('📌 Using fallback silence WAV...');
    
    try {
      const silenceBuffer = generateSilenceWAV();
      const url = await uploadToCloudinary(
        silenceBuffer,
        `learning-audio/${pointId}`,
        'raw'
      );

      console.log(`✅ Silence WAV uploaded (fallback): ${url}`);
      return url;
    } catch (uploadError) {
      console.error(`❌ Fallback upload failed: ${uploadError.message}`);
      throw uploadError;
    }
  }
};

module.exports = { generateAudioForPoint };