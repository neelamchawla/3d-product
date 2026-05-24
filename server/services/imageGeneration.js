import https from 'https';
import { Configuration, OpenAIApi } from 'openai';

const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'pollinations';
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || 'flux';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL || 'black-forest-labs/FLUX.1-schnell';

export const cleanSubject = (userPrompt) =>
  userPrompt
    .trim()
    .replace(/^(create|make|generate|design)\s+(a\s+)?/i, '')
    .replace(/\s+logo$/i, '')
    .trim();

export const buildPrompt = (userPrompt, type) => {
  const subject = cleanSubject(userPrompt);

  if (type === 'full') {
    return `Vibrant full-coverage t-shirt design featuring ${subject}. Bold graphics, print-ready, high contrast.`;
  }

  return `Clean minimal logo of ${subject}. Simple vector-style icon, centered on plain white background, suitable for t-shirt printing. No text unless specified.`;
};

const fetchBuffer = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, options, (response) => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        fetchBuffer(response.headers.location, options).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Image request failed with status ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });

    request.on('error', reject);
  });

const postBuffer = (url, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers,
        },
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);

          if (response.statusCode !== 200) {
            reject(
              new Error(
                buffer.toString() || `Request failed with status ${response.statusCode}`
              )
            );
            return;
          }

          resolve(buffer);
        });
        response.on('error', reject);
      }
    );

    request.on('error', reject);
    request.write(payload);
    request.end();
  });

async function generateWithPollinations(prompt, type) {
  const size = type === 'full' ? 1024 : 512;
  const params = new URLSearchParams({
    width: String(size),
    height: String(size),
    model: POLLINATIONS_MODEL,
    nologo: 'true',
    seed: String(Date.now()),
  });

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
  const buffer = await fetchBuffer(url);
  const mimeType = buffer[0] === 0x89 ? 'image/png' : 'image/jpeg';

  return { photo: buffer.toString('base64'), mimeType };
}

async function generateWithHuggingFace(prompt) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  const url = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;
  const buffer = await postBuffer(url, { inputs: prompt }, {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
  });

  return { photo: buffer.toString('base64'), mimeType: 'image/jpeg' };
}

async function generateWithOpenAI(prompt, type) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  );

  const response = await openai.createImage({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    n: 1,
    size: '1024x1024',
    background: type === 'logo' ? 'transparent' : 'opaque',
    output_format: 'png',
  });

  const image = response.data.data[0].b64_json;

  if (!image) {
    throw new Error('No image was returned from OpenAI');
  }

  return { photo: image, mimeType: 'image/png' };
}

export async function generateImage(userPrompt, type = 'logo') {
  const prompt = buildPrompt(userPrompt, type);

  switch (IMAGE_PROVIDER) {
    case 'openai':
      return generateWithOpenAI(prompt, type);
    case 'huggingface':
      return generateWithHuggingFace(prompt);
    case 'pollinations':
    default:
      return generateWithPollinations(prompt, type);
  }
}
