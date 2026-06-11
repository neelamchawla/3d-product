import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import dalleRoutes from './routes/dalle.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limig: "50mb" }));

app.use("/api/v1/dalle", dalleRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: "Hello from DALL.E" })
});

app.listen(8080, () => {
  console.log('Server has started on port 8080');

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
    }
  }
});