// Uses OpenRouter for learning points (better rate limits)
// Uses YouTube Data API v3 for REAL video search

const axiosLib = require('axios');

const retryWithBackoffPoints = async (fn, maxRetries = 3, initialDelayMs = 2000) => {
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
      console.log(`⚠️ Request failed. Waiting ${delayMs}ms before retry ${attempt + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};


//open router api use kiya for point generation
const callOpenRouter = async (prompt) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  return retryWithBackoffPoints(async () => {
    const response = await axiosLib.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1-distill-qwen-32b',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    
    const text = response.data.choices[0]?.message?.content;
    if (!text) {
      throw new Error('No content in OpenRouter response');
    }
    return text.trim();
  });
};

const generateLearningPoints = async (topic, userQuery) => {
  const prompt = `Generate 4 beginner-friendly learning points explaining "${topic}". 
Each point should be 1-2 clear sentences. 
Respond to: "${userQuery}". 
Return ONLY as JSON array of strings, nothing else.
Example: ["Point 1 text", "Point 2 text", ...]`;

  try {
    console.log(`📚 Generating learning points for "${topic}"...`);
    const result = await callOpenRouter(prompt);

    if (!result) {
      throw new Error('Empty response from OpenRouter');
    }

    try {
      const points = JSON.parse(result);
      if (Array.isArray(points) && points.length > 0) {
        const limitedPoints = points.slice(0, 4);
        console.log(`✅ Generated ${limitedPoints.length} learning points (max 4)`);
        return limitedPoints;
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON, splitting by newlines...');
      const points = result
        .split('\n')
        .map(p => p.replace(/^\d+\.\s*/, '').trim())
        .filter(p => p.length > 10 && p.length < 500)
        .slice(0, 4);
      
      if (points.length > 0) {
        console.log(`✅ Generated ${points.length} learning points from text`);
        return points;
      }
    }
  } catch (err) {
    console.error(`❌ Learning points generation failed: ${err.message}`);
    
    console.log('📦 Using fallback learning points (max 4)...');
    return [
      `Overview of ${topic} in simple terms.`,
      `Why ${topic} matters in real life.`,
      `Key concepts of ${topic}.`,
      `Real-world applications of ${topic}.`,
    ];
  }
};


//utube api use kiya haii
const searchYouTubeVideos = async (topic) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY is not configured');
    console.log('📦 Using mock YouTube videos as fallback...');
    return getMockYouTubeVideos(topic);
  }

  try {
    console.log(`🎥 Searching YouTube videos for "${topic}"...`);

    const response = await retryWithBackoffPoints(async () => {
      return await axiosLib.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            q: topic,
            part: 'snippet',
            type: 'video',
            maxResults: 5,
            order: 'relevance',
            key: apiKey,
            videoDuration: 'any',
            relevanceLanguage: 'en',
            safeSearch: 'moderate',
          },
          timeout: 30000,
        }
      );
    });

    const videos = response.data.items.map(item => {
      const videoId = item.id.videoId;
      return {
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        videoId: videoId,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      };
    });

    console.log(`✅ Found ${videos.length} real YouTube videos`);
    return videos;

  } catch (err) {
    console.error(`❌ YouTube search failed: ${err.message}`);
    
    if (err.response?.status === 403) {
      console.error(`\n   💡 API Error - Check if YouTube Data API v3 is enabled`);
    }
    if (err.response?.status === 401) {
      console.error(`\n   💡 API Key Error - Invalid or expired YouTube API key`);
    }
    
    console.log('📦 Using mock YouTube videos as fallback...');
    return getMockYouTubeVideos(topic);
  }
};

//utube ka fall back
const getMockYouTubeVideos = (topic) => {
  return [
    {
      title: `${topic} - Full Tutorial for Beginners`,
      url: `https://youtube.com/watch?v=dQw4w9WgXcQ`,
      videoId: 'dQw4w9WgXcQ',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      channelTitle: 'Educational Channel',
      publishedAt: new Date().toISOString(),
    },
    {
      title: `${topic} Explained Simply`,
      url: `https://youtube.com/watch?v=jNQXAC9IVRw`,
      videoId: 'jNQXAC9IVRw',
      thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
      channelTitle: 'Learning Hub',
      publishedAt: new Date().toISOString(),
    },
    {
      title: `${topic} - Deep Dive Guide`,
      url: `https://youtube.com/watch?v=9bZkp7q19f0`,
      videoId: '9bZkp7q19f0',
      thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
      channelTitle: 'Expert Tutorials',
      publishedAt: new Date().toISOString(),
    },
    {
      title: `${topic} in Real Life`,
      url: `https://youtube.com/watch?v=kJQP7kiw9Fk`,
      videoId: 'kJQP7kiw9Fk',
      thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw9Fk/hqdefault.jpg',
      channelTitle: 'Practical Learning',
      publishedAt: new Date().toISOString(),
    },
    {
      title: `${topic} - Expert Q&A`,
      url: `https://youtube.com/watch?v=OPf0YbXqDm0`,
      videoId: 'OPf0YbXqDm0',
      thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
      channelTitle: 'Ask Experts',
      publishedAt: new Date().toISOString(),
    },
  ];
};

module.exports = { generateLearningPoints, searchYouTubeVideos };