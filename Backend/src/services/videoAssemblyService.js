const admin = require('../utils/firebaseAdmin');
const { extractText } = require('./ocrService');
const { summarizeContent, generateConceptSummary } = require('./summarizationService');
const { searchYouTubeVideos } = require('./pointGenerationService');
const { generateLearningPoints } = require('./pointGenerationService');
const { generateMediaForPoint } = require('./mediaGenerationService');
const { mergeImageAndAudio, mergeAllVideos } = require('./videoMergingService');

const db = admin.firestore();
const rtdb = admin.database();

const processLearningVideo = async (chatId, fileBase64, fileType, topic, userQuery) => {
  const chatRef = db.collection('chats').doc(chatId);
  const rtdbRef = rtdb.ref(`progress/${chatId}`);

  try {
    // Stage 1: Text Extraction
    await rtdbRef.set({ stage: 'Extracting text', percent: 10 });
    const extractedText = await extractText(fileBase64, fileType);
    await chatRef.update({
      extractedText: extractedText.substring(0, 2000),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Stage 2: Summarization
    await rtdbRef.set({ stage: 'Summarizing content', percent: 25 });
    let processedText = extractedText;
    try {
      if (extractedText.split(' ').length > 1000) {
        processedText = await summarizeContent(extractedText, topic);
      }
      await chatRef.update({ summary: processedText });
    } catch (summaryErr) {
      console.error('Summarization failed, using extracted text:', summaryErr.message);
      await chatRef.update({
        summary: extractedText,
        error: `Summary fallback: ${summaryErr.message}`,
      });
      processedText = extractedText;
    }

    // Stage 3: Concept Summary
    await rtdbRef.set({ stage: 'Creating concept summary', percent: 35 });
    try {
      const conceptSummary = await generateConceptSummary(processedText, topic, userQuery);
      await chatRef.update({ conceptSummary });
    } catch (conceptErr) {
      console.error('Concept summary failed, using fallback:', conceptErr.message);
      const fallback = processedText.slice(0, 800) || 'Concept summary unavailable.';
      await chatRef.update({
        conceptSummary: fallback,
        error: `Concept summary fallback: ${conceptErr.message}`,
      });
    }

    // Stage 4: YouTube Search
    await rtdbRef.set({ stage: 'Searching learning resources', percent: 45 });
    const youtubeVideos = await searchYouTubeVideos(topic);
    await chatRef.update({ youtubeVideos });

    // Stage 5: Learning Points (MAX 4 POINTS)
    await rtdbRef.set({ stage: 'Generating learning points', percent: 55 });
    let points = await generateLearningPoints(topic, userQuery);
    
    // IMPORTANT: Limit to 4 points max
    points = points.slice(0, 4);
    console.log(`\n📌 Processing ${points.length} points (max 4)\n`);

    const pointDocs = points.map((text, i) => ({
      pointId: `point-${i + 1}`,
      text,
      status: 'pending',
      imageUrl: '',
      audioUrl: '',
      slideUrl: '',
      videoUrl: ''
    }));
    await chatRef.update({ points: pointDocs });

    // Stage 6+7: SEQUENTIAL Media + Video per Point
    const updatedPoints = [];
    
    for (let i = 0; i < pointDocs.length; i++) {
      const point = pointDocs[i];
      const pointNumber = i + 1;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📌 [${pointNumber}/${pointDocs.length}] Processing: "${point.text.slice(0, 40)}..."`);
      console.log(`${'='.repeat(60)}`);

      const progressPercent = 55 + Math.floor((i / pointDocs.length) * 40);
      await rtdbRef.set({ 
        stage: `Processing point ${pointNumber}/${pointDocs.length}`, 
        percent: progressPercent 
      });

      try {
        // Step 1: Generate media (image + audio)
        console.log(`   ⏳ Step 1/3: Generating media...`);
        const { imageUrl, audioUrl } = await generateMediaForPoint(point.text, point.pointId, chatId);
        console.log(`   ✅ Media generated`);

        // Step 2: Merge image + audio to video
        console.log(`   ⏳ Step 2/3: Merging to video...`);
        const videoUrl = await mergeImageAndAudio(imageUrl, audioUrl, point.pointId, chatId);
        console.log(`   ✅ Video created`);

        // Step 3: Update Firestore
        console.log(`   ⏳ Step 3/3: Saving to database...`);
        updatedPoints.push({ 
          ...point, 
          imageUrl, 
          audioUrl, 
          videoUrl, 
          status: 'completed' 
        });

        const currentDoc = await chatRef.get();
        const currentPoints = currentDoc.data().points;
        currentPoints[i] = updatedPoints[i];
        await chatRef.update({ points: currentPoints });
        console.log(`   ✅ Saved to Firebase\n`);

      } catch (err) {
        console.error(`\n❌ Point ${pointNumber} failed: ${err.message}\n`);
        updatedPoints.push({ 
          ...point, 
          status: 'failed', 
          error: err.message 
        });

        const currentDoc = await chatRef.get();
        const currentPoints = currentDoc.data().points;
        currentPoints[i] = updatedPoints[i];
        await chatRef.update({ points: currentPoints });
      }

      // WAIT 3 seconds before next point (sequential processing)
      if (i < pointDocs.length - 1) {
        console.log(`⏸️  Waiting 3 seconds before next point...\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Stage 8: Final Concatenation
    await rtdbRef.set({ stage: 'Creating final video', percent: 95 });
    
    const videoUrls = updatedPoints
      .filter(p => p.status === 'completed')
      .map(p => p.videoUrl);

    if (videoUrls.length === 0) {
      await chatRef.update({
        status: 'failed',
        error: 'All point media generation failed. Check API connectivity.',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await rtdbRef.set({ stage: 'Failed', percent: 0 });
      return;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎬 Concatenating ${videoUrls.length} videos into final video...`);
    console.log(`${'='.repeat(60)}\n`);

    const finalVideoUrl = await mergeAllVideos(videoUrls, chatId);
    
    await chatRef.update({
      finalVideoUrl,
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await rtdbRef.set({ stage: 'Complete', percent: 100 });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ ✅ ✅ VIDEO GENERATION COMPLETE ✅ ✅ ✅`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Final Video: ${finalVideoUrl}\n`);

  } catch (err) {
    console.error('Pipeline error:', err.message);
    await chatRef.update({
      status: 'failed',
      error: err.message,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await rtdbRef.set({ stage: 'Failed', percent: 0, error: err.message });
    throw err;
  }
};

module.exports = { processLearningVideo };