export const downloadCanvasToImage = () => {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");

  link.href = dataURL;
  link.download = "canvas.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const reader = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = () => reject(new Error("Failed to read file"));
    fileReader.readAsDataURL(file);
  });

export const getContrastingColor = (color) => {
  if (!color || typeof color !== "string") {
    return "black";
  }

  const hex = color.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return "black";
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "black" : "white";
};
