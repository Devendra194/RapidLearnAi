const ffmpeg = require('fluent-ffmpeg');
const { uploadToCloudinary } = require('./cloudinaryService');
const { promises: fsPromises } = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');

// glaobal fetch haii mujhe nhi ata ai ne diya hai 
const fetchImpl = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

const fetchBuffer = async (url) => {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
};

const mergeImageAndAudio = async (imageUrl, audioUrl, pointId, chatId) => {
  const tempDir = tmpdir();
  const imageExt = imageUrl.split('.').pop().split('?')[0];
  const imageFile = join(tempDir, `${pointId}.image.${imageExt}`);
  const audioFile = join(tempDir, `${pointId}.audio.mp3`);
  const outputFile = join(tempDir, `${pointId}.video.mp4`);

  try {
    const imageBuffer = await fetchBuffer(imageUrl);
    const audioBuffer = await fetchBuffer(audioUrl);

    await fsPromises.writeFile(imageFile, imageBuffer);
    await fsPromises.writeFile(audioFile, audioBuffer);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(imageFile)
        .input(audioFile)
        .inputFormat('mp3')
        .videoCodec('libx264')
        .format('mp4')
        .on('end', resolve)
        .on('error', reject)
        .save(outputFile);
    });

    const videoBuffer = await fsPromises.readFile(outputFile);
    return await uploadToCloudinary(videoBuffer, `rapidlearnai/${chatId}/videos`, 'video');
  } catch (error) {
    console.error('Video merge failed:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  } finally {
    // Always attempt cleanup to avoid leaking temp files
    await Promise.allSettled([
      fsPromises.unlink(imageFile).catch(() => {}),
      fsPromises.unlink(audioFile).catch(() => {}),
      fsPromises.unlink(outputFile).catch(() => {}),
    ]);
  }
};

const mergeAllVideos = async (videoUrls, chatId) => {
  const tempDir = tmpdir();
  const listFile = join(tempDir, `${chatId}_list.txt`);
  const outputFile = join(tempDir, `${chatId}_final.mp4`);
  const localPaths = [];

  try {
    for (let i = 0; i < videoUrls.length; i++) {
      const buffer = await fetchBuffer(videoUrls[i]);
      const localPath = join(tempDir, `${chatId}_part_${i}.mp4`);
      await fsPromises.writeFile(localPath, buffer);
      localPaths.push(localPath);
    }

    const listContent = localPaths.map(p => `file '${p}'`).join('\n');
    await fsPromises.writeFile(listFile, listContent);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .videoCodec('copy')
        .format('mp4')
        .on('end', resolve)
        .on('error', reject)
        .save(outputFile);
    });

    const finalBuffer = await fsPromises.readFile(outputFile);
    return await uploadToCloudinary(finalBuffer, `rapidlearnai/${chatId}`, 'video');
  } catch (error) {
    console.error('Concatenation failed:', error);
    throw new Error(`Final video concatenation failed: ${error.message}`);
  } finally {
    // Ensure temp files are removed even on failure
    await Promise.allSettled([
      fsPromises.unlink(listFile).catch(() => {}),
      fsPromises.unlink(outputFile).catch(() => {}),
      ...localPaths.map(p => fsPromises.unlink(p).catch(() => {})),
    ]);
  }
};

module.exports = { mergeImageAndAudio, mergeAllVideos };
