import https from 'https';
import { InferenceClient } from '@huggingface/inference';
import { Configuration, OpenAIApi } from 'openai';

const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'huggingface';
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || 'flux';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL || 'black-forest-labs/FLUX.1-schnell';
const HUGGINGFACE_PROVIDER = process.env.HUGGINGFACE_PROVIDER || 'auto';

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

const requestBuffer = (url, { method = 'GET', body, headers = {} } = {}) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const request = https.request(
      url,
      {
        method,
        headers: {
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              }
            : {}),
          ...headers,
        },
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);

          if (response.statusCode !== 200) {
            let message = buffer.toString();

            try {
              const parsed = JSON.parse(message);
              message = parsed.error || parsed.message || message;
            } catch {
              // keep raw message
            }

            if (response.statusCode === 503) {
              reject(
                new Error(
                  'Model is loading. Please wait 20 seconds and try again.'
                )
              );
              return;
            }

            reject(
              new Error(message || `Request failed with status ${response.statusCode}`)
            );
            return;
          }

          resolve(buffer);
        });
        response.on('error', reject);
      }
    );

    request.on('error', reject);
    if (payload) request.write(payload);
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

  try {
    const buffer = await fetchBuffer(url);
    const mimeType = buffer[0] === 0x89 ? 'image/png' : 'image/jpeg';
    return { photo: buffer.toString('base64'), mimeType };
  } catch (error) {
    if (error.message.includes('402')) {
      throw new Error(
        'Pollinations now requires payment. Set IMAGE_PROVIDER=huggingface and add a free HUGGINGFACE_API_KEY.'
      );
    }
    throw error;
  }
}

async function generateWithHuggingFace(prompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();

  if (!apiKey || apiKey === 'your-huggingface-token-here') {
    throw new Error(
      'HUGGINGFACE_API_KEY is not configured. Get a free token at https://huggingface.co/settings/tokens and add it to server/.env'
    );
  }

  const client = new InferenceClient(apiKey);

  try {
    const blob = await client.textToImage({
      provider: HUGGINGFACE_PROVIDER,
      model: HUGGINGFACE_MODEL,
      inputs: prompt,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const mimeType = buffer[0] === 0x89 ? 'image/png' : 'image/jpeg';

    return { photo: buffer.toString('base64'), mimeType };
  } catch (error) {
    const message = error.message || String(error);
    const lower = message.toLowerCase();

    if (
      lower.includes('not found') ||
      lower.includes('repository not found') ||
      lower.includes('provider mapping')
    ) {
      throw new Error(
        `Model "${HUGGINGFACE_MODEL}" was not found or has no inference provider. Verify the model exists at https://huggingface.co/${HUGGINGFACE_MODEL}`
      );
    }

    if (
      lower.includes('invalid username or password') ||
      lower.includes('unauthorized')
    ) {
      throw new Error(
        'Hugging Face authentication failed. Check HUGGINGFACE_API_KEY in server/.env — create a token with Inference permissions at https://huggingface.co/settings/tokens'
      );
    }

    if (message.includes('403') || message.toLowerCase().includes('gated')) {
      throw new Error(
        `Access to ${HUGGINGFACE_MODEL} is restricted. Accept the model license at https://huggingface.co/${HUGGINGFACE_MODEL}`
      );
    }

    if (message.toLowerCase().includes('not supported for task')) {
      throw new Error(
        `${HUGGINGFACE_MODEL} does not support text-to-image via the selected provider. Try FLUX.1-schnell or set HUGGINGFACE_PROVIDER=auto.`
      );
    }

    throw error;
  }
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

  const image = response.data?.data?.[0]?.b64_json;

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
    case 'pollinations':
      return generateWithPollinations(prompt, type);
    case 'huggingface':
    default:
      return generateWithHuggingFace(prompt);
  }
}
