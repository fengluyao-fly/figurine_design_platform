import Replicate from "replicate";
import sharp from "sharp";
import { storagePut } from "./storage.js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export interface NanoBananaOptions {
  prompt: string;
  imageUrl?: string;
  resolution?: "1K" | "2K" | "4K";
}

export interface ThreeViewResult {
  frontView: string;
  sideView: string;
  backView: string;
}

/**
 * Generate a three-view product design sheet using Nano Banana Pro
 * Returns URLs to 3 separate images (front, side, back views)
 */
export async function generateThreeViews(
  options: NanoBananaOptions
): Promise<ThreeViewResult> {
  const { prompt, imageUrl, resolution = "2K" } = options;

  // Construct prompt for three-view generation
  let threeViewPrompt: string;
  
  if (imageUrl) {
    // If user provided an image
    if (prompt && prompt.trim()) {
      // User provided both image and text: modify the image according to text
      threeViewPrompt = `Product design sheet showing three orthographic views of: ${prompt}. Layout: front view on left, side view in center, back view on right. Show the COMPLETE FULL BODY from head to toe, do not crop any part. White background, professional product photography, studio lighting, clean separation between views.`;
    } else {
      // User provided only image, no text: strictly preserve original style and composition
      threeViewPrompt = `Create a product design sheet with three orthographic views (front, side, back) of this subject. CRITICAL REQUIREMENTS: 1) Preserve the EXACT composition and framing of the reference image - if it shows upper body, generate upper body views; if it shows full body, generate full body views. DO NOT extrapolate or add missing parts. 2) Maintain the exact style, colors, clothing, pose, and all visual characteristics from the reference image. 3) Layout: front view on left, side view in center, back view on right. 4) White background, clean separation between views. 5) Match the reference image's level of detail and cropping exactly.`;
    }
  } else {
    // Text-only input (no image)
    threeViewPrompt = `Product design sheet, ${prompt}, three orthographic views: front view, side view, back view, arranged horizontally. Show the COMPLETE FULL BODY from head to toe. White background, professional product photography, studio lighting, technical drawing style, clean layout.`;
  }

  console.log("[Nano Banana] Generating three-view sheet...");
  console.log("[Nano Banana] Prompt:", threeViewPrompt);

  // Call Nano Banana Pro API
  const input: Record<string, unknown> = {
    prompt: threeViewPrompt,
    resolution,
    output_format: "png",
    aspect_ratio: "16:9", // Wide format for horizontal three-view layout
  };

  if (imageUrl) {
    input.image_input = [imageUrl];
  }

  // Retry logic for rate limiting
  let output: unknown;
  let retries = 0;
  const maxRetries = 5;
  
  while (retries <= maxRetries) {
    try {
      output = await replicate.run("google/nano-banana-pro", {
        input,
      });
      break; // Success, exit retry loop
    } catch (error: any) {
      // Check if it's a 429 rate limit error
      const is429Error = error.response?.status === 429 || 
                         error.message?.includes("429") || 
                         error.message?.includes("rate limit") ||
                         error.message?.includes("throttled");
      
      if (is429Error) {
        retries++;
        
        if (retries > maxRetries) {
          throw new Error(`Rate limit exceeded after ${maxRetries} retries. Please check your Replicate account balance or wait longer.`);
        }
        
        // Extract retry_after from error message if available
        let waitTime = 10; // Default 10 seconds
        const retryAfterMatch = error.message?.match(/retry_after[":\s]+(\d+)/);
        if (retryAfterMatch) {
          waitTime = parseInt(retryAfterMatch[1]) + 2; // Add 2 seconds buffer
        }
        
        console.log(`[Nano Banana] Rate limited (429). Waiting ${waitTime}s before retry ${retries}/${maxRetries}...`);
        console.log(`[Nano Banana] Error message:`, error.message);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        // Continue to next iteration of while loop
      } else {
        // Not a rate limit error, throw immediately
        throw error;
      }
    }
  }

  // Handle different output formats from Replicate
  let sheetUrl: string;
  
  if (typeof output === "string") {
    // Direct URL string
    sheetUrl = output;
  } else if (output && typeof output === "object") {
    // Check if it has a url() method (Replicate FileOutput)
    if (typeof (output as any).url === "function") {
      sheetUrl = (output as any).url();
      console.log("[Nano Banana] Extracted URL from output.url():", sheetUrl);
    } else if ("url" in output && typeof (output as any).url === "string") {
      // Direct url property
      sheetUrl = (output as any).url;
    } else if (Array.isArray(output) && output.length > 0) {
      // Array of URLs
      const firstItem = output[0];
      if (typeof firstItem === "string") {
        sheetUrl = firstItem;
      } else if (typeof firstItem?.url === "function") {
        sheetUrl = firstItem.url();
      } else {
        sheetUrl = firstItem?.url || "";
      }
    } else {
      throw new Error(`Nano Banana Pro returned unexpected output format: ${JSON.stringify(output)}`);
    }
  } else {
    throw new Error(`Nano Banana Pro returned invalid output type: ${typeof output}`);
  }
  console.log("[Nano Banana] Generated sheet URL:", sheetUrl);

  // Download the generated image with retry logic
  let imageBuffer: Buffer | undefined;
  let downloadRetries = 0;
  const maxDownloadRetries = 3;
  
  while (downloadRetries <= maxDownloadRetries) {
    try {
      console.log(`[Nano Banana] Downloading image (attempt ${downloadRetries + 1}/${maxDownloadRetries + 1})...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(sheetUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to download generated image: ${response.statusText}`);
      }
      
      imageBuffer = Buffer.from(await response.arrayBuffer());
      console.log(`[Nano Banana] Successfully downloaded image (${imageBuffer.length} bytes)`);
      break; // Success, exit retry loop
    } catch (error: any) {
      downloadRetries++;
      
      if (downloadRetries > maxDownloadRetries) {
        throw new Error(`Failed to download image after ${maxDownloadRetries} retries: ${error.message}`);
      }
      
      console.log(`[Nano Banana] Download failed: ${error.message}. Retrying in 5s...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  if (!imageBuffer) {
    throw new Error("Failed to download image: imageBuffer is undefined");
  }

  // Split the image into 3 equal parts (left, center, right)
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  const viewWidth = Math.floor(width / 3);

  console.log("[Nano Banana] Splitting image:", { width, height, viewWidth });

  // Extract front view (left third)
  const frontBuffer = await sharp(imageBuffer)
    .extract({ left: 0, top: 0, width: viewWidth, height })
    .toBuffer();

  // Extract side view (middle third)
  const sideBuffer = await sharp(imageBuffer)
    .extract({ left: viewWidth, top: 0, width: viewWidth, height })
    .toBuffer();

  // Extract back view (right third)
  const backBuffer = await sharp(imageBuffer)
    .extract({ left: viewWidth * 2, top: 0, width: viewWidth, height })
    .toBuffer();

  // Upload all 3 views to S3
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);

  console.log("[Nano Banana] Uploading split views to S3...");

  const [frontResult, sideResult, backResult] = await Promise.all([
    storagePut(
      `three-views/${timestamp}-${randomSuffix}-front.png`,
      frontBuffer,
      "image/png"
    ),
    storagePut(
      `three-views/${timestamp}-${randomSuffix}-side.png`,
      sideBuffer,
      "image/png"
    ),
    storagePut(
      `three-views/${timestamp}-${randomSuffix}-back.png`,
      backBuffer,
      "image/png"
    ),
  ]);

  console.log("[Nano Banana] Three views generated and uploaded successfully");

  return {
    frontView: frontResult.url,
    sideView: sideResult.url,
    backView: backResult.url,
  };
}
