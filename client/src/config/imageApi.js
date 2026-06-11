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
    script.onload = () => resolve(window.puter);
    script.onerror = () => reject(new Error("Failed to load image generation library"));
    document.head.appendChild(script);
  });
};

const imageElementToDataUrl = (img) =>
  new Promise((resolve, reject) => {
    if (img.src?.startsWith("data:")) {
      resolve(img.src);
      return;
    }

    const draw = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
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
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, type }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate image");
  }

  return data;
}

export async function generateAIImage(backendUrl, prompt, type = "logo") {
  try {
    return await generateFromBackend(backendUrl, prompt, type);
  } catch (backendError) {
    const skipBackendLog =
      backendError.message?.includes("HUGGINGFACE_API_KEY") ||
      backendError.message?.includes("Pollinations");

    if (!skipBackendLog) {
      console.warn("Backend unavailable, using browser AI:", backendError.message);
    }

    return generateFromPuter(prompt, type);
  }
}
