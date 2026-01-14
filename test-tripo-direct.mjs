// Direct test of Tripo API to see the exact response format
import 'dotenv/config';

const TRIPO_API_BASE = "https://api.tripo3d.ai/v2/openapi";
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;

console.log("TRIPO_API_KEY configured:", !!TRIPO_API_KEY);

async function getTaskStatus(taskId) {
  const response = await fetch(`${TRIPO_API_BASE}/task/${taskId}`, {
    headers: {
      Authorization: `Bearer ${TRIPO_API_KEY}`,
    },
  });
  
  const data = await response.json();
  return data;
}

async function createTestTask() {
  // Use NEWLY generated image URLs from the latest project (480013)
  const testImages = [
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663279679404/MMPeiPEYV4xzt6Po2BN4fh/four-views/1768380007321-38co1s-front.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663279679404/MMPeiPEYV4xzt6Po2BN4fh/four-views/1768380007321-38co1s-left.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663279679404/MMPeiPEYV4xzt6Po2BN4fh/four-views/1768380007321-38co1s-back.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663279679404/MMPeiPEYV4xzt6Po2BN4fh/four-views/1768380007321-38co1s-right.png",
  ];
  
  console.log("\n=== Creating new multiview_to_model task ===");
  console.log("Using images:", testImages);
  
  // First verify images are accessible
  console.log("\n=== Verifying image accessibility ===");
  for (const url of testImages) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${url.split('/').pop()}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`${url.split('/').pop()}: FAILED - ${error.message}`);
    }
  }
  
  const response = await fetch(`${TRIPO_API_BASE}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TRIPO_API_KEY}`,
    },
    body: JSON.stringify({
      type: "multiview_to_model",
      files: [
        { type: "png", url: testImages[0] }, // front
        { type: "png", url: testImages[1] }, // left
        { type: "png", url: testImages[2] }, // back
        { type: "png", url: testImages[3] }, // right
      ],
      model_version: "v2.5-20250123",
      texture: true,
      pbr: true,
      face_limit: 50000,
    }),
  });
  
  const data = await response.json();
  console.log("\nCreate task response:", JSON.stringify(data, null, 2));
  
  if (data.code !== 0) {
    console.error("Failed to create task");
    return null;
  }
  
  return data.data.task_id;
}

async function pollTaskUntilComplete(taskId, maxWaitSeconds = 300) {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds
  
  console.log(`\n=== Polling task ${taskId} ===`);
  
  while (true) {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > maxWaitSeconds) {
      console.error(`Task ${taskId} timed out after ${maxWaitSeconds}s`);
      return null;
    }
    
    const result = await getTaskStatus(taskId);
    console.log(`[${elapsed.toFixed(1)}s] Status:`, result.data?.status, "Progress:", result.data?.progress);
    
    if (result.data?.status === "success") {
      console.log("\n=== TASK COMPLETED SUCCESSFULLY ===");
      console.log("Full response:", JSON.stringify(result, null, 2));
      console.log("\n=== OUTPUT OBJECT ===");
      console.log("output:", JSON.stringify(result.data?.output, null, 2));
      console.log("\n=== OUTPUT FIELDS ===");
      console.log("Keys:", Object.keys(result.data?.output || {}));
      console.log("model:", result.data?.output?.model);
      console.log("pbr_model:", result.data?.output?.pbr_model);
      console.log("base_model:", result.data?.output?.base_model);
      console.log("rendered_image:", result.data?.output?.rendered_image);
      return result;
    }
    
    if (result.data?.status === "failed" || result.data?.status === "cancelled") {
      console.error(`Task ${taskId} ${result.data?.status}`);
      console.log("Full response:", JSON.stringify(result, null, 2));
      return result;
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}

async function main() {
  console.log("=== Tripo API Direct Test ===");
  console.log("Time:", new Date().toISOString());
  
  // Create a new task
  const taskId = await createTestTask();
  
  if (!taskId) {
    console.error("Failed to create task");
    return;
  }
  
  // Poll until complete
  await pollTaskUntilComplete(taskId);
}

main().catch(console.error);
