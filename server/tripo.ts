import axios from "axios";

const TRIPO_API_BASE = "https://api.tripo3d.ai/v2/openapi";
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;

interface TripoTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
}

interface TripoTaskStatus {
  code: number;
  data: {
    task_id: string;
    status: "queued" | "running" | "success" | "failed" | "cancelled";
    output?: {
      model?: string;
      pbr_model?: string;
      rendered_image?: string;
      base_model?: string;
    };
    progress?: number;
  };
}

/**
 * Create a multiview-to-3D task with Tripo AI
 * @param imageUrls Array of 4 image URLs in order: [front, left, back, right]
 * @returns Task ID for polling
 */
export async function createMultiviewTo3DTask(imageUrls: string[]): Promise<string> {
  if (imageUrls.length !== 4) {
    throw new Error("Multiview generation requires exactly 4 images (front, left, back, right)");
  }

  // Use all 4 views for better 3D reconstruction accuracy
  const files = [
    { type: "jpg", url: imageUrls[0] }, // front
    { type: "jpg", url: imageUrls[1] }, // left
    { type: "jpg", url: imageUrls[2] }, // back
    { type: "jpg", url: imageUrls[3] }, // right
  ];

  const response = await axios.post<TripoTaskResponse>(
    `${TRIPO_API_BASE}/task`,
    {
      type: "multiview_to_model",
      files,
      model_version: "v2.5-20250123",
      texture: true,
      pbr: true,
      face_limit: 50000, // Increased from 10k to 50k for better quality
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`Tripo API error: ${response.data}`);
  }

  return response.data.data.task_id;
}

/**
 * Check the status of a Tripo task
 * @param taskId Task ID from createMultiviewTo3DTask
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
    throw new Error(`Tripo API error: ${response.data}`);
  }

  return response.data.data;
}

/**
 * Apply high-quality texture to an existing 3D model
 * @param originalTaskId Task ID of the original 3D model
 * @returns New task ID for texture enhancement
 */
export async function applyDetailedTexture(originalTaskId: string): Promise<string> {
  if (!TRIPO_API_KEY) {
    throw new Error("TRIPO_API_KEY is not configured");
  }

  console.log("[Tripo] Applying detailed texture to model:", originalTaskId);

  const response = await axios.post<TripoTaskResponse>(
    `${TRIPO_API_BASE}/task`,
    {
      type: "texture_model",
      original_model_task_id: originalTaskId,
      model_version: "v3.0-20250812",
      texture_quality: "detailed",
      texture: true,
      pbr: true,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    }
  );

  if (response.data.code !== 0) {
    throw new Error(`Tripo API error: ${response.data}`);
  }

  console.log("[Tripo] Detailed texture task created:", response.data.data.task_id);
  return response.data.data.task_id;
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

    if (status.status === "success") {
      return status;
    }

    if (status.status === "failed" || status.status === "cancelled") {
      throw new Error(`Task ${taskId} ${status.status}`);
    }

    // Still running or queued, wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}
