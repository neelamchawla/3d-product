import https from 'https';
import { InferenceClient } from '@huggingface/inference';
import { Configuration, OpenAIApi } from 'openai';

const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || 'huggingface';
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || 'flux';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL || 'black-forest-labs/FLUX.1-schnell';
const HUGGINGFACE_PROVIDER = process.env.HUGGINGFACE_PROVIDER || 'auto';

const HUGGINGFACE_FALLBACK_MODELS = [
  HUGGINGFACE_MODEL,
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/sdxl-turbo',
  'ByteDance/SDXL-Lightning',
].filter((model, index, models) => models.indexOf(model) === index);

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

export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong';

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (typeof error.body === 'string' && error.body.trim()) {
    return error.body;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Something went wrong';
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

const mapHuggingFaceError = (error, model) => {
  const message = getErrorMessage(error);
  const lower = message.toLowerCase();

  if (
    lower.includes('not found') ||
    lower.includes('repository not found') ||
    lower.includes('provider mapping')
  ) {
    return new Error(
      `Model "${model}" was not found or has no inference provider. Verify it at https://huggingface.co/${model}`
    );
  }

  if (
    lower.includes('invalid username or password') ||
    lower.includes('unauthorized') ||
    lower.includes('authentication')
  ) {
    return new Error(
      'Hugging Face authentication failed. Set HUGGINGFACE_API_KEY on Render with a token that has Inference permissions: https://huggingface.co/settings/tokens'
    );
  }

  if (message.includes('403') || lower.includes('gated')) {
    return new Error(
      `Access to ${model} is restricted. Accept the model license at https://huggingface.co/${model}`
    );
  }

  if (lower.includes('not supported for task')) {
    return new Error(
      `${model} does not support text-to-image via the selected provider.`
    );
  }

  if (lower.includes('loading') || lower.includes('503')) {
    return new Error('Model is loading. Please wait 20 seconds and try again.');
  }

  return error instanceof Error ? error : new Error(message);
};

async function generateWithHuggingFaceModel(client, prompt, model) {
  const blob = await client.textToImage({
    provider: HUGGINGFACE_PROVIDER,
    model,
    inputs: prompt,
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  const mimeType = buffer[0] === 0x89 ? 'image/png' : 'image/jpeg';

  return { photo: buffer.toString('base64'), mimeType };
}

async function generateWithHuggingFace(prompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();

  if (!apiKey || apiKey === 'your-huggingface-token-here') {
    throw new Error(
      'HUGGINGFACE_API_KEY is not configured on the server. Add your free token in Render environment variables: https://huggingface.co/settings/tokens'
    );
  }

  const client = new InferenceClient(apiKey);
  let lastError;

  for (const model of HUGGINGFACE_FALLBACK_MODELS) {
    try {
      console.log(`Trying Hugging Face model: ${model}`);
      return await generateWithHuggingFaceModel(client, prompt, model);
    } catch (error) {
      lastError = mapHuggingFaceError(error, model);
      console.warn(`Model ${model} failed:`, getErrorMessage(lastError));
    }
  }

  throw lastError || new Error('All Hugging Face models failed. Please try again.');
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

export function getHuggingFaceStatus() {
  const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();

  return {
    provider: IMAGE_PROVIDER,
    apiKeyConfigured: Boolean(apiKey && apiKey !== 'your-huggingface-token-here'),
    model: HUGGINGFACE_MODEL,
    inferenceProvider: HUGGINGFACE_PROVIDER,
    fallbackModels: HUGGINGFACE_FALLBACK_MODELS,
  };
}
