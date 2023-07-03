import express from 'express';
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi} from 'openai';

dotenv.config();

const router = express.Router();

const config = new Configuration({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey: "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",
});
// console.log(config);

const openai = new OpenAIApi(config);
console.log("openai ->", openai);

router.route('/').get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" })
  console.log("req ->", req);
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("prompt ->", prompt);

    const response = await openai.createImage({
      prompt,
      n: 1,
      size: '1024x1024',
      // response_format: 'b64_json'
      response_format: 'url'
    });
    console.log("response ->", response);
    
    const image = response.data.data[0].b64_json;
    console.log("image ->", image);

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" })
  }
});

export default router;