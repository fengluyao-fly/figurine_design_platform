/**
 * Image generation using Replicate API
 * 
 * Uses FLUX.1 Schnell model for fast, high-quality image generation
 */
import Replicate from "replicate";
import { storagePut } from "./storage";

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

export type ReplicateImageOptions = {
  prompt: string;
  imageUrl?: string; // Optional reference image for img2img
};

export type ReplicateImageResponse = {
  url: string;
};

export async function generateImageWithReplicate(
  options: ReplicateImageOptions
): Promise<ReplicateImageResponse> {
  if (!REPLICATE_API_KEY) {
    throw new Error("REPLICATE_API_KEY is not configured. Please add it in Settings → Secrets");
  }

  const replicate = new Replicate({
    auth: REPLICATE_API_KEY,
  });

  try {
    // Use FLUX.1 Schnell for fast generation
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: options.prompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          ...(options.imageUrl ? { image: options.imageUrl } : {}),
        },
      }
    ) as string[];

    if (!output || output.length === 0) {
      throw new Error("No image generated from Replicate");
    }

    const imageUrl = output[0];
    
    // Download the image and upload to S3
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Save to S3
    const { url } = await storagePut(
      `generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`,
      buffer,
      "image/png"
    );

    return { url };
  } catch (error) {
    console.error("Replicate image generation error:", error);
    throw new Error(
      `Replicate image generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
