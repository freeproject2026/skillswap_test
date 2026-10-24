import express from 'express';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Simple in-memory rate limiter per IP/user
const rateLimitMap = new Map();

const isLearningTopic = (prompt) => {
  const p = prompt.toLowerCase();
  const LEARNING_KEYWORDS = [
    'code', 'coding', 'python', 'javascript', 'react', 'css', 'html', 'sql', 'dsa',
    'algorithm', 'data structure', 'math', 'calculus', 'physics', 'design', 'figma',
    'learn', 'study', 'explain', 'homework', 'tutorial', 'exam', 'interview', 'revision',
    'project', 'roadmap', 'practice', 'course', 'college', 'assignment', 'how does',
    'difference between', 'guide', 'architecture', 'shader', 'three.js', 'bug', 'error'
  ];

  const RESTRICTED_KEYWORDS = [
    'crypto trading', 'gamble', 'buy stocks', 'politics', 'celebrity gossip', 'hack account',
    'bypass security', 'weapons', 'illegal'
  ];

  if (RESTRICTED_KEYWORDS.some(k => p.includes(k))) return false;
  // If prompt has at least 1 learning keyword or asks for help/explanation
  return LEARNING_KEYWORDS.some(k => p.includes(k)) || p.includes('help') || p.includes('what is') || p.length < 15;
};

router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, contextTopic, notesContext } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    // Rate limiting: 20 requests per minute
    const clientKey = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();
    const clientLimit = rateLimitMap.get(clientKey) || { count: 0, resetAt: now + 60000 };

    if (now > clientLimit.resetAt) {
      clientLimit.count = 0;
      clientLimit.resetAt = now + 60000;
    }

    if (clientLimit.count >= 25) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a minute before asking the AI Companion again.'
      });
    }

    clientLimit.count += 1;
    rateLimitMap.set(clientKey, clientLimit);

    // Topic restriction filter
    if (!isLearningTopic(message)) {
      return res.json({
        success: true,
        reply: "I am SkillSwap's AI Academic Companion, dedicated exclusively to learning and education. I can help you with coding, algorithms, project architecture, math, design, interview prep, and revision. Please ask a learning-related question!",
        topicAllowed: false
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // If no API key is configured, return a clear setup error rather than silently falling back
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please set the OPENAI_API_KEY environment variable on the server.',
        setupRequired: true
      });
    }

    // Call OpenAI API
    try {
      const systemPrompt = `You are the SkillSwap Academic Companion, an empathetic, pedagogically sound AI tutor assisting university students.
Context topic: ${contextTopic || 'General Academic'}.
${notesContext ? `Active session notes: ${notesContext}` : ''}
Guide students with clear step-by-step reasoning, practical examples, and relevant code. Never give harmful or non-educational advice.`;

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      const data = await openAiRes.json();
      if (data.choices && data.choices[0]) {
        return res.json({
          success: true,
          reply: data.choices[0].message.content,
          modelUsed: model,
          topicAllowed: true
        });
      }
      // OpenAI returned no choices — surface a clear error
      return res.status(502).json({
        success: false,
        error: 'AI provider returned an unexpected response. Please try again.',
        raw: data.error || null
      });
    } catch (apiErr) {
      console.error('OpenAI API request failed:', apiErr.message);
      return res.status(502).json({
        success: false,
        error: 'AI provider is temporarily unavailable. Please try again later.'
      });
    }
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, error: 'Internal AI tutor error.' });
  }
});

export default router;
