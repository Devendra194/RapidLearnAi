const axios = require('axios');

const callOpenRouter = async (prompt, model = 'deepseek/deepseek-r1') => {
  if (!process.env.OPENROUTER_API_KEY) {
    // Surface configuration issue clearly instead of 401 from openrouter
    throw new Error('OpenRouter API key (OPENROUTER_API_KEY) is not configured');
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    // Add useful context for 4xx errors so the pipeline can store a clear reason
    const status = err.response?.status;
    const message = err.response?.data?.error?.message || err.message;
    throw new Error(`OpenRouter request failed${status ? ` (status ${status})` : ''}: ${message}`);
  }
};

const summarizeContent = async (text, topic) => {
  const prompt = `Summarize the following text about "${topic}" in 300 words or less. Keep key concepts and remove redundant information.\n\nText:\n${text}`;
  return await callOpenRouter(prompt);
};

const generateConceptSummary = async (text, topic, userQuery) => {
  const prompt = `Create a student-friendly explanation (max 200 words) of the concept "${topic}" based on the provided material. Include real-world examples and explain why it's relevant. Answer the query: "${userQuery}".\n\nMaterial:\n${text}`;
  return await callOpenRouter(prompt);
};

module.exports = { summarizeContent, generateConceptSummary };
