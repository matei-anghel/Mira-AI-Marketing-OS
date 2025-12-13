import { fileToBase64, extractDominantColors, overlayAdCopy, loadImage } from './image-processing';
import { generateImage, generateText, buildAdPrompt } from './ai-engine';

export async function createAdCreative(payload: {
  productImage: File;
  modelImage?: File | null;
  brand?: string;
  product?: string;
  tone?: string;
  platform?: string;
  userText?: string;
  aspectRatio?: string;
  batchCount?: number;
  temperature?: number;
  overlayPosition?: string;
}) {
  try {
    const prodB64 = await fileToBase64(payload.productImage);
    const prodImg = await loadImage(prodB64);
    const palette = extractDominantColors(prodImg);

    let modelB64 = "";
    if (payload.modelImage) modelB64 = await fileToBase64(payload.modelImage);

    const prompt = buildAdPrompt(
      "Product",
      palette,
      payload.userText || "",
      !!payload.modelImage,
      payload.aspectRatio || "1:1"
    );

    const refs = [prodB64];
    if (modelB64) refs.unshift(modelB64);

    const { images, log: imgLog } = await generateImage(prompt, refs, payload.batchCount || 1);
    if (!images.length) throw new Error("No image generated.");

    const finalImageB64 = images[0];

    const copyPrompt = `Write ad copy (JSON) for ${payload.brand || "Brand"} ${payload.product || "Product"}. Tone: ${payload.tone}. Platform: ${payload.platform}. Return keys: headline, subheadline, cta, hashtags.`;
    const copyText = await generateText(copyPrompt);

    let copyData = { headline: "New Arrival", subheadline: "Check it out", cta: "Shop Now", hashtags: ["#style"] };
    try {
      const jsonStr = copyText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      copyData = { ...copyData, ...parsed };
    } catch (e) { console.warn("JSON Parse Error", e); }

    const finalWithOverlay = await overlayAdCopy(
      finalImageB64.startsWith("http") ? finalImageB64 : finalImageB64,
      copyData.headline,
      copyData.subheadline,
      copyData.cta,
      payload.overlayPosition || "Bottom Left",
      palette
    );

    return {
      image_base64: finalWithOverlay.split(',')[1],
      copy: copyData,
      palette_hexes: palette,
      prompt: prompt,
      log: imgLog + "\n\nCopy: " + copyText
    };
  } catch (e: any) {
    throw new Error(e.message || "Generation Failed");
  }
}

async function genericEdit(payload: any, type: string) {
  const refs: string[] = [];
  if (payload.userPhoto) refs.push(await fileToBase64(payload.userPhoto));
  if (payload.faceImage) refs.push(await fileToBase64(payload.faceImage));
  if (payload.modelImage) refs.push(await fileToBase64(payload.modelImage));
  if (payload.subjectImage) refs.push(await fileToBase64(payload.subjectImage));

  if (payload.garments) {
    for (const g of payload.garments) refs.push(await fileToBase64(g));
  }
  if (payload.eyewearImages) {
    for (const g of payload.eyewearImages) refs.push(await fileToBase64(g));
  }
  if (payload.backgroundImage) refs.push(await fileToBase64(payload.backgroundImage));

  let prompt = `Perform a ${type} task. `;
  if (payload.prompt) prompt += payload.prompt;
  if (payload.measurements) prompt += ` Measurements: ${payload.measurements}`;
  prompt += ` Aspect Ratio: ${payload.aspectRatio || "1:1"}`;

  const { images, log } = await generateImage(prompt, refs, payload.batchCount || 1);

  const cleanImages = images.map(i => i.includes("base64,") ? i.split("base64,")[1] : i);

  return {
    images_base64: cleanImages,
    log: log
  };
}

export async function createVirtualTryOn(payload: any) { return genericEdit({ ...payload, batchCount: 1 }, "Virtual Try-On"); }
export async function createBackgroundSwap(payload: any) { return genericEdit({ ...payload, batchCount: 1 }, "Background Swap"); }
export async function createEyewearTryOn(payload: any) { return genericEdit({ ...payload, batchCount: 1 }, "Eyewear Try-On"); }
export async function createModelsService(payload: any) { return genericEdit({ ...payload, batchCount: 1 }, "Professional Model Edit"); }
export async function createAIModelGeneration(payload: any) {
  const prompt = `Generate a professional model. ${payload.prompt}. Pose: ${payload.poseStyle}. Light: ${payload.lightingStyle}.`;
  const { images, log } = await generateImage(prompt, [], payload.batchCount || 1);
  const cleanImages = images.map(i => i.includes("base64,") ? i.split("base64,")[1] : i);
  return { images_base64: cleanImages, log };
}
export async function createCatalogViews(payload: any) {
  const prodB64 = await fileToBase64(payload.productImage);
  const { images, log } = await generateImage(`Catalog Front View. Background: ${payload.backgroundText}`, [prodB64], payload.batchCount || 1);
  const cleanImages = images.map(i => i.includes("base64,") ? i.split("base64,")[1] : i);
  return { images_base64: cleanImages, log };
}
