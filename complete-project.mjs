import mysql from 'mysql2/promise';
import { storagePut } from './server/_core/storage.js';

const projectId = 570002;
const modelUrl = 'https://tripo-data.rg1.data.tripo3d.com/tcli_8a3e65c668af4b23870a91394328b774/20260114/99b5b459-3827-4771-8938-1b4d8c6a717e/tripo_pbr_model_99b5b459-3827-4771-8938-1b4d8c6a717e.glb?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90cmlwby1kYXRhLnJnMS5kYXRhLnRyaXBvM2QuY29tL3RjbGlfOGEzZTY1YzY2OGFmNGIyMzg3MGE5MTM5NDMyOGI3NzQvMjAyNjAxMTQvOTliNWI0NTktMzgyNy00NzcxLTg5MzgtMWI0ZDhjNmE3MTdlL3RyaXBvX3Bicl9tb2RlbF85OWI1YjQ1OS0zODI3LTQ3NzEtODkzOC0xYjRkOGM2YTcxN2UuZ2xiIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzY4NDM1MjAwfX19XX0_&Signature=A5Rx68J0V1TZCS0DazO5deLGQP2U99BXZjIbymWNF1YnyC7lvHx0YpBgN99nkt9VZSPaplw~keRJZ1i6Lfp4GzbNYemMYT5jmMMNpb6sB9bFrARMwn476kfgeGxjQUx6nTIJLbkzMmTjwH5GHb0A~RW4-m6xkYbtveZNA3722DmfZHX1rj6-M0HQXwCkQ3vL06kA-SDNe2wz4AbYe4SeS7o7rHgJoGSEx0lvxL99UDDq3PAwqvD4qL1qcydhNv-zBjs88FI1aiSFg6863T6lMLohOIlhBa7YojAZSUIMFzZT~yWAmM4ajB-1a3xn3gXynzhTI9wqbBiI6FMhGNH7hw__&Key-Pair-Id=K1676C64NMVM2J';

async function main() {
  console.log('Downloading GLB...');
  const response = await fetch(modelUrl);
  if (!response.ok) throw new Error('Failed to download: ' + response.status);
  
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log('Downloaded', buffer.length, 'bytes');
  
  // Upload to S3
  const timestamp = Date.now();
  const glbKey = `3d-models/${timestamp}-robot.glb`;
  const { url: savedUrl } = await storagePut(glbKey, buffer, 'model/gltf-binary');
  console.log('Saved to S3:', savedUrl);
  
  // Update database
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute('UPDATE projects SET status = ?, tripoTaskStatus = ?, modelUrl = ?, modelKey = ? WHERE id = ?',
    ['completed', 'success', savedUrl, glbKey, projectId]);
  console.log('Updated project', projectId);
  await conn.end();
}

main().catch(console.error);
