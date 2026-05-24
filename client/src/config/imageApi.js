const POLLINATIONS_MODEL = "flux";

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

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const [, base64] = result.split(",");
      resolve({ photo: base64, mimeType: blob.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export async function generateFromPollinations(prompt, type = "logo") {
  const enhancedPrompt = buildPrompt(prompt, type);
  const size = type === "full" ? 1024 : 512;
  const params = new URLSearchParams({
    width: String(size),
    height: String(size),
    model: POLLINATIONS_MODEL,
    nologo: "true",
    seed: String(Date.now()),
  });

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to generate image. Please try again in a few seconds.");
  }

  return blobToBase64(await response.blob());
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
    throw new Error(data.message || "Backend failed to generate image");
  }

  return data;
}

export async function generateAIImage(backendUrl, prompt, type = "logo") {
  try {
    return await generateFromBackend(backendUrl, prompt, type);
  } catch (backendError) {
    console.warn("Backend unavailable, using Pollinations directly:", backendError.message);
    return generateFromPollinations(prompt, type);
  }
}
