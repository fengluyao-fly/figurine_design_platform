import axios from "axios";

const TRIPO_API_BASE = "https://api.tripo3d.ai/v2/openapi";
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;

interface TripoTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
}

interface TripoModelOutput {
  type: string;
  url: string;
}

interface TripoTaskStatus {
  code: number;
  data: {
    task_id: string;
    status: "queued" | "running" | "success" | "failed" | "cancelled";
    output?: {
      model?: string | TripoModelOutput;
      pbr_model?: string | TripoModelOutput;
      rendered_image?: string | TripoModelOutput;
      base_model?: string | TripoModelOutput;
    };
    result?: {
      model?: TripoModelOutput;
      pbr_model?: TripoModelOutput;
      rendered_image?: TripoModelOutput;
      base_model?: TripoModelOutput;
    };
    progress?: number;
  };
}

/**
 * Create a text-to-3D task with Tripo AI
 * @param prompt Text description of the 3D model
 * @returns Task ID for polling
 */
export async function createTextTo3DTask(prompt: string): Promise<string> {
  if (!TRIPO_API_KEY) {
    throw new Error("TRIPO_API_KEY is not configured");
  }

  console.log("[Tripo] Creating text-to-3D task with prompt:", prompt.substring(0, 100));

  const response = await axios.post<TripoTaskResponse>(
    `${TRIPO_API_BASE}/task`,
    {
      type: "text_to_model",
      prompt,
      model_version: "v2.5-20250123",
      texture: true,
      pbr: true,
      texture_quality: "standard", // Speed priority
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`Tripo API error: ${JSON.stringify(response.data)}`);
  }

  console.log("[Tripo] Text-to-3D task created:", response.data.data.task_id);
  return response.data.data.task_id;
}

/**
 * Create an image-to-3D task with Tripo AI
 * @param imageUrl URL of the image
 * @returns Task ID for polling
 */
export async function createImageTo3DTask(imageUrl: string): Promise<string> {
  if (!TRIPO_API_KEY) {
    throw new Error("TRIPO_API_KEY is not configured");
  }

  console.log("[Tripo] Creating image-to-3D task with image:", imageUrl.substring(0, 80));

  const response = await axios.post<TripoTaskResponse>(
    `${TRIPO_API_BASE}/task`,
    {
      type: "image_to_model",
      file: {
        type: "jpg",
        url: imageUrl,
      },
      model_version: "v2.5-20250123",
      texture: true,
      pbr: true,
      texture_quality: "standard",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`Tripo API error: ${JSON.stringify(response.data)}`);
  }

  console.log("[Tripo] Image-to-3D task created:", response.data.data.task_id);
  return response.data.data.task_id;
}

/**
 * Create a multiview-to-3D task with Tripo AI
 * IMPORTANT: Views must be from CHARACTER's perspective, not viewer's!
 * @param imageUrls Array of 1-4 image URLs in order: [front, left, back, right]
 *   - front: Character facing camera (REQUIRED)
 *   - left: Character's LEFT side (their left arm visible)
 *   - back: Character's back
 *   - right: Character's RIGHT side (their right arm visible)
 * @returns Task ID for polling
 */
export async function createMultiviewTo3DTask(imageUrls: string[]): Promise<string> {
  if (!TRIPO_API_KEY) {
    throw new Error("TRIPO_API_KEY is not configured");
  }

  if (imageUrls.length < 1 || imageUrls.length > 4) {
    throw new Error("Multiview generation requires 1-4 images");
  }

  console.log("[Tripo] Creating multiview-to-3D task with", imageUrls.length, "images");
  console.log("[Tripo] View order: [front, left, back, right]");

  // Build files array - must be exactly 4 items, but can omit file_token for missing views
  // Order: [front, left, back, right]
  const files: Array<{ type: string; url?: string }> = [];
  
  for (let i = 0; i < 4; i++) {
    if (i < imageUrls.length && imageUrls[i]) {
      files.push({ type: "jpg", url: imageUrls[i] });
    } else {
      // Omit this view by not providing url
      files.push({ type: "jpg" });
    }
  }

  const response = await axios.post<TripoTaskResponse>(
    `${TRIPO_API_BASE}/task`,
    {
      type: "multiview_to_model",
      files,
      model_version: "v2.5-20250123",
      texture: true,
      pbr: true,
      texture_quality: "standard",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`Tripo API error: ${JSON.stringify(response.data)}`);
  }

  console.log("[Tripo] Multiview-to-3D task created:", response.data.data.task_id);
  return response.data.data.task_id;
}

/**
 * Check the status of a Tripo task
 * @param taskId Task ID
 * @returns Task status and output URLs if completed
 */
export async function getTaskStatus(taskId: string): Promise<TripoTaskStatus["data"]> {
  const response = await axios.get<TripoTaskStatus>(
    `${TRIPO_API_BASE}/task/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`Tripo API error: ${JSON.stringify(response.data)}`);
  }

  return response.data.data;
}

/**
 * Poll task until completion (with timeout)
 * @param taskId Task ID to poll
 * @param maxWaitSeconds Maximum time to wait (default 300s = 5min)
 * @returns Final task data with model URLs
 */
export async function waitForTaskCompletion(
  taskId: string,
  maxWaitSeconds: number = 300
): Promise<TripoTaskStatus["data"]> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  while (true) {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > maxWaitSeconds) {
      throw new Error(`Task ${taskId} timed out after ${maxWaitSeconds}s`);
    }

    const status = await getTaskStatus(taskId);
    
    console.log(`[Tripo] Task ${taskId} status: ${status.status}, progress: ${status.progress || 0}%`);

    if (status.status === "success") {
      console.log(`[Tripo] Task ${taskId} completed successfully`);
      console.log(`[Tripo] Output:`, JSON.stringify(status.output, null, 2));
      return status;
    }

    if (status.status === "failed" || status.status === "cancelled") {
      throw new Error(`Task ${taskId} ${status.status}`);
    }

    // Still running or queued, wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

/**
 * Get the model URL from task result
 * Handles both pbr_model and model fields
 */
export function getModelUrlFromResult(data: TripoTaskStatus["data"]): string | null {
  // Check result field first (new API format)
  if (data.result) {
    const pbrModel = data.result.pbr_model;
    if (pbrModel && typeof pbrModel === 'object' && pbrModel.url) {
      return pbrModel.url;
    }
    const model = data.result.model;
    if (model && typeof model === 'object' && model.url) {
      return model.url;
    }
  }
  
  // Check output field (legacy format)
  if (data.output) {
    const pbrModel = data.output.pbr_model;
    if (pbrModel) {
      if (typeof pbrModel === 'string') return pbrModel;
      if (typeof pbrModel === 'object' && pbrModel.url) return pbrModel.url;
    }
    const model = data.output.model;
    if (model) {
      if (typeof model === 'string') return model;
      if (typeof model === 'object' && model.url) return model.url;
    }
  }
  
  return null;
}
