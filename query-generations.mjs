import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true }
  });

  console.log("=== Recent Generations ===\n");
  
  const [rows] = await connection.execute(
    'SELECT id, projectId, type, groupNumber, assetUrls, createdAt FROM generations ORDER BY createdAt DESC LIMIT 5'
  );
  
  for (const row of rows) {
    console.log(`ID: ${row.id}, Project: ${row.projectId}, Type: ${row.type}, Group: ${row.groupNumber}`);
    console.log(`Created: ${row.createdAt}`);
    
    try {
      const urls = JSON.parse(row.assetUrls);
      console.log(`URLs (${urls.length}):`);
      for (const url of urls) {
        console.log(`  - ${url}`);
      }
    } catch (e) {
      console.log(`URLs: ${row.assetUrls}`);
    }
    console.log('---');
  }
  
  await connection.end();
}

main().catch(console.error);
