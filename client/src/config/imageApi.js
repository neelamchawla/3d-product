const MAX_PROMPT_LENGTH = 500;
const ALLOWED_TYPES = new Set(["logo", "full"]);

const cleanSubject = (userPrompt) =>
  userPrompt
    .trim()
    .replace(/^(create|make|generate|design)\s+(a\s+)?/i, "")
    .replace(/\s+logo$/i, "")
    .trim();

const buildPrompt = (userPrompt, type) => {
  const subject = cleanSubject(userPrompt);

  if (type === "full") {
    return `Vibrant full-coverage t-shirt design featuring ${subject}. Bold graphics, print-ready, high contrast.`;
  }

  return `Clean minimal logo of ${subject}. Simple vector-style icon, centered on plain white background, suitable for t-shirt printing. No text unless specified.`;
};

const loadPuter = () => {
  if (window.puter) return Promise.resolve(window.puter);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.puter));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(window.puter);
    script.onerror = () => reject(new Error("Failed to load image generation library"));
    document.head.appendChild(script);
  });
};

const imageElementToDataUrl = (img) =>
  new Promise((resolve, reject) => {
    if (!img?.src) {
      reject(new Error("Invalid image element"));
      return;
    }

    if (img.src.startsWith("data:")) {
      resolve(img.src);
      return;
    }

    const draw = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };

    if (img.complete && img.naturalWidth) {
      draw();
      return;
    }

    img.onload = draw;
    img.onerror = () => reject(new Error("Failed to load generated image"));
  });

const PUTER_MODELS = [
  { model: "gpt-image-1-mini", quality: "low" },
  { model: "gpt-image-1.5", quality: "low" },
  {
    model: "black-forest-labs/flux-schnell",
    provider: "replicate-image-generation",
  },
];

export async function generateFromPuter(prompt, type = "logo") {
  const puter = await loadPuter();
  if (!puter?.ai?.txt2img) {
    throw new Error("Image generation library is unavailable");
  }

  const enhancedPrompt = buildPrompt(prompt, type);
  let lastError;

  for (const options of PUTER_MODELS) {
    try {
      const imageEl = await puter.ai.txt2img(enhancedPrompt, options);
      const dataUrl = await imageElementToDataUrl(imageEl);
      const [, mimeType, photo] = dataUrl.match(/^data:(.+);base64,(.+)$/) || [];

      if (!photo) {
        throw new Error("No image data returned");
      }

      return { photo, mimeType: mimeType || "image/png" };
    } catch (error) {
      lastError = error;
      console.warn(`Puter model ${options.model} failed:`, error.message || error);
    }
  }

  throw new Error(
    lastError?.message || "Failed to generate image. Please try again."
  );
}

export async function generateFromBackend(backendUrl, prompt, type = "logo") {
  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Prompt is required");
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`);
  }

  if (!ALLOWED_TYPES.has(type)) {
    throw new Error("Invalid image type");
  }

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: trimmedPrompt, type }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Failed to generate image");
  }

  if (!data?.photo) {
    throw new Error("No image was returned from server");
  }

  return data;
}

const isBackendConfigError = (message = "") =>
  message.includes("HUGGINGFACE_API_KEY") ||
  message.includes("OPENAI_API_KEY") ||
  message.includes("Pollinations") ||
  message.includes("Hugging Face authentication failed") ||
  message.includes("was not found or has no inference provider") ||
  message.includes("does not support text-to-image") ||
  message.includes("Access to") ||
  message.includes("Model is loading");

export async function generateAIImage(backendUrl, prompt, type = "logo") {
  try {
    return await generateFromBackend(backendUrl, prompt, type);
  } catch (backendError) {
    if (isBackendConfigError(backendError.message)) {
      throw backendError;
    }

    console.warn("Backend unavailable:", backendError.message);
    throw backendError;
  }
}
