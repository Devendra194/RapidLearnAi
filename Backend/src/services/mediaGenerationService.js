const { generateImageForPoint } = require('./imageGenerationService');
const { generateAudioForPoint } = require('./audioGenerationService');

const generateMediaForPoint = async (text, pointId, chatId) => {
  try {
    console.log(`   ⏳ Generating image for ${pointId}...`);
    const imageUrl = await generateImageForPoint(text);
    console.log(`   ✅ Image generated`);

    // WAIT for image to complete, THEN start audio
    //Queues type process banaya hu
    console.log(`   ⏳ Generating audio for ${pointId}...`);
    const audioUrl = await generateAudioForPoint(text, pointId, chatId);
    console.log(`   ✅ Audio generated`);

    return { imageUrl, audioUrl };
  } catch (error) {
    console.error('Media generation failed for point:', error.message);
    throw error;
  }
};

module.exports = { generateMediaForPoint };