import express from 'express';
import { generateImage } from '../services/imageGeneration.js';

const router = express.Router();

router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from DALL.E ROUTES' });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt, type = 'logo' } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const { photo, mimeType } = await generateImage(prompt, type);

    res.status(200).json({ photo, mimeType });
  } catch (error) {
    console.error(error.message || error);

    const message = error.message || 'Something went wrong';
    res.status(500).json({ message });
  }
});

export default router;
