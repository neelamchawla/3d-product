import express from 'express';
import {
  generateImage,
  getErrorMessage,
  getHuggingFaceStatus,
} from '../services/imageGeneration.js';

const router = express.Router();

const MAX_PROMPT_LENGTH = 500;
const ALLOWED_TYPES = new Set(['logo', 'full']);

router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from DALL.E ROUTES' });
});

router.route('/status').get((req, res) => {
  res.status(200).json(getHuggingFaceStatus());
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt, type = 'logo' } = req.body ?? {};

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        message: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`,
      });
    }

    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ message: 'Invalid image type' });
    }

    const { photo, mimeType } = await generateImage(trimmedPrompt, type);

    if (!photo) {
      return res.status(502).json({ message: 'No image was generated' });
    }

    res.status(200).json({ photo, mimeType });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Image generation failed:', message, error);

    const statusCode = message.includes('not configured') ? 503 : 500;
    res.status(statusCode).json({ message });
  }
});

export default router;
