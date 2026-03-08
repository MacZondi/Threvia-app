const express = require('express');
const axios = require('axios');

const router = express.Router();

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 700;

router.post('/', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Chat service is not configured on server' });
    }

    const { messages, system, model, max_tokens } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' });
    }

    const sanitizedMessages = messages
      .filter(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          item.content.trim()
      )
      .map((item) => ({
        role: item.role,
        content: item.content.trim(),
      }));

    if (
      sanitizedMessages.length === 0 ||
      !sanitizedMessages.some((message) => message.role === 'user')
    ) {
      return res.status(400).json({ error: 'at least one valid user message is required' });
    }

    const selectedModel =
      (typeof model === 'string' && model.trim()) ||
      process.env.ANTHROPIC_MODEL ||
      DEFAULT_MODEL;

    const parsedMaxTokens = Number(max_tokens);
    const boundedMaxTokens = Number.isFinite(parsedMaxTokens)
      ? Math.min(Math.max(parsedMaxTokens, 128), 2048)
      : DEFAULT_MAX_TOKENS;

    const payload = {
      model: selectedModel,
      max_tokens: boundedMaxTokens,
      messages: sanitizedMessages,
    };

    if (typeof system === 'string' && system.trim()) {
      payload.system = system.trim();
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 30000,
    });

    const reply = response.data?.content?.find((block) => block?.type === 'text')?.text?.trim();

    if (!reply) {
      return res.status(502).json({ error: 'Chat provider returned an empty response' });
    }

    return res.json({
      reply,
      model: selectedModel,
    });
  } catch (error) {
    console.error('Chat route error:', error.response?.data || error.message);

    const providerStatus = error.response?.status;
    if (providerStatus === 401 || providerStatus === 403) {
      return res.status(503).json({ error: 'Chat provider authentication failed' });
    }
    if (providerStatus === 429) {
      return res.status(429).json({ error: 'Chat service is rate-limited. Try again shortly.' });
    }

    return res.status(500).json({ error: 'Chat request failed' });
  }
});

module.exports = router;
