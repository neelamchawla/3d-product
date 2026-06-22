import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import dalleRoutes from './routes/dalle.routes.js';

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  })
);

app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

app.use('/api/v1/dalle', apiLimiter, dalleRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from DALL.E' });
});

app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'Origin not allowed' });
    return;
  }
  next(err);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);

  const provider = process.env.IMAGE_PROVIDER || 'huggingface';
  const hfKey = process.env.HUGGINGFACE_API_KEY?.trim();

  console.log(`Image provider: ${provider}`);

  if (provider === 'huggingface') {
    if (!hfKey || hfKey === 'your-huggingface-token-here') {
      console.warn(
        '⚠️  HUGGINGFACE_API_KEY is missing. Add your free token to server/.env — https://huggingface.co/settings/tokens'
      );
    } else {
      console.log('Hugging Face API key: configured');
      console.log(
        `Hugging Face model: ${process.env.HUGGINGFACE_MODEL || 'black-forest-labs/FLUX.1-schnell'} (${process.env.HUGGINGFACE_PROVIDER || 'auto'})`
      );
    }
  }
});
