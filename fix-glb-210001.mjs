import { storagePut } from './server/storage.ts';
import mysql from 'mysql2/promise';

(async () => {
  try {
    const glbUrl = "https://tripo-data.rg1.data.tripo3d.com/tcli_1590b53ec9064cf19f009ddbc4a7a90e/20260113/0340a791-e462-45df-a667-165447caeada/tripo_pbr_model_0340a791-e462-45df-a667-165447caeada.glb?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90cmlwby1kYXRhLnJnMS5kYXRhLnRyaXBvM2QuY29tL3RjbGlfMTU5MGI1M2VjOTA2NGNmMTlmMDA5ZGRiYzRhN2E5MGUvMjAyNjAxMTMvMDM0MGE3OTEtZTQ2Mi00NWRmLWE2NjctMTY1NDQ3Y2FlYWRhL3RyaXBvX3Bicl9tb2RlbF8wMzQwYTc5MS1lNDYyLTQ1ZGYtYTY2Ny0xNjU0NDdjYWVhZGEuZ2xiIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzY4MzQ4ODAwfX19XX0_&Signature=fWQlP-PtkzKlvFf-9thrZrOgGOccxsiXbbbmLF0UA0Fgmuo70kCGNIErTDHDFlbB8GuV9CgmwxE2wnouU19Rz4vIH2qYSg-u4hQOlqdoTb2rOEsSh-aUANsPwvlWm0GH2HL~J4Jb0SGaUaQV-1URyIwuD7jO~4PUL7gN4Wv60wcZlh7EreI5aK~DgYGBKtNZRViop3buIYQAmovzcra5YHIr3N17EHjUwtKXF6o1U4lceawb4iAO1oLPcUUVa3TtWU9Vnwrytf0AgLqNrfF8iPHSMjHhLqSTdhEirvoxUWC9hQBRjNpyxEhNCNhqH3W97c3YDgWr7HurLBgiXa76nQ__&Key-Pair-Id=K1676C64NMVM2J";
    
    console.log('[Manual Fix] Downloading GLB...');
    const response = await fetch(glbUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const glbBuffer = Buffer.from(await response.arrayBuffer());
    console.log('[Manual Fix] Downloaded:', glbBuffer.length, 'bytes');
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const glbKey = `3d-models/${timestamp}-${randomStr}.glb`;
    
    console.log('[Manual Fix] Uploading to S3...');
    const { url: s3Url } = await storagePut(glbKey, glbBuffer, 'model/gltf-binary');
    
    console.log('[Manual Fix] Success! S3 URL:', s3Url);
    console.log('[Manual Fix] Key:', glbKey);
    
    // Update database
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    await connection.execute(
      'UPDATE generations SET assetUrls = ?, assetKeys = ?, metadata = ? WHERE id = 210004',
      [
        JSON.stringify([s3Url]),
        JSON.stringify([glbKey]),
        JSON.stringify({
          tripoTaskId: "0340a791-e462-45df-a667-165447caeada",
          status: "completed",
          sourceGenerationId: 210002
        })
      ]
    );
    await connection.end();
    
    console.log('[Manual Fix] Database updated!');
    
  } catch (error) {
    console.error('[Manual Fix] Error:', error);
    process.exit(1);
  }
})();
