import mysql from 'mysql2/promise';

// Use the Manus storage proxy
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, '');
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function storagePut(relKey, data, contentType = 'application/octet-stream') {
  const key = relKey.replace(/^\/+/, '');
  const uploadUrl = new URL('v1/storage/upload', FORGE_API_URL + '/');
  uploadUrl.searchParams.set('path', key);
  
  const blob = new Blob([data], { type: contentType });
  const form = new FormData();
  form.append('file', blob, key.split('/').pop() || key);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${FORGE_API_KEY}` },
    body: form,
  });
  
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${message}`);
  }
  
  const result = await response.json();
  return { key, url: result.url };
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get project info
  const [rows] = await conn.execute('SELECT id, tripoTaskId FROM projects WHERE id = 570003');
  const project = rows[0];
  console.log('Project:', project);
  
  // Get model URL from Tripo
  const res = await fetch('https://api.tripo3d.ai/v2/openapi/task/' + project.tripoTaskId, {
    headers: { 'Authorization': 'Bearer ' + process.env.TRIPO_API_KEY }
  });
  const data = await res.json();
  
  // Extract model URL
  const modelUrl = data.data.result?.pbr_model?.url || data.data.output?.pbr_model;
  console.log('Model URL:', modelUrl?.substring(0, 100) + '...');
  
  if (modelUrl) {
    // Download GLB
    console.log('Downloading GLB...');
    const glbRes = await fetch(modelUrl);
    const glbBuffer = Buffer.from(await glbRes.arrayBuffer());
    console.log('Downloaded', glbBuffer.length, 'bytes');
    
    // Upload to S3 via storage proxy
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const glbKey = `3d-models/${timestamp}-${randomStr}.glb`;
    
    console.log('Uploading to storage...');
    const { url: savedUrl } = await storagePut(glbKey, glbBuffer, 'model/gltf-binary');
    console.log('Saved to S3:', savedUrl);
    
    // Update database
    await conn.execute('UPDATE projects SET status = ?, tripoTaskStatus = ?, modelUrl = ?, modelKey = ? WHERE id = ?', 
      ['completed', 'success', savedUrl, glbKey, 570003]);
    console.log('Updated project 570003');
  }
  
  await conn.end();
}

main().catch(console.error);
