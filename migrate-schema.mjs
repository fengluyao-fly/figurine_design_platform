import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function migrate() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('Starting schema migration...');
  
  try {
    // Add new columns to projects table
    const alterStatements = [
      // Add inputType column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS inputType ENUM('text', 'single_image', 'multi_view') NOT NULL DEFAULT 'text'`,
      // Add textPrompt column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS textPrompt TEXT`,
      // Add imageUrls column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS imageUrls TEXT`,
      // Add imageKeys column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS imageKeys TEXT`,
      // Add fourViewUrls column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS fourViewUrls TEXT`,
      // Add fourViewKeys column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS fourViewKeys TEXT`,
      // Add tripoTaskId column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS tripoTaskId VARCHAR(128)`,
      // Add tripoTaskStatus column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS tripoTaskStatus ENUM('pending', 'queued', 'running', 'success', 'failed') DEFAULT 'pending'`,
      // Add modelUrl column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS modelUrl VARCHAR(512)`,
      // Add modelKey column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS modelKey VARCHAR(512)`,
      // Add regenerationCount column
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS regenerationCount INT NOT NULL DEFAULT 0`,
      // Modify status column to include new statuses
      `ALTER TABLE projects MODIFY COLUMN status ENUM('draft', 'generating', 'generating_views', 'views_ready', 'generating_3d', 'completed', 'ordered') NOT NULL DEFAULT 'draft'`,
    ];
    
    for (const sql of alterStatements) {
      try {
        console.log('Executing:', sql.substring(0, 80) + '...');
        await connection.execute(sql);
        console.log('  ✓ Success');
      } catch (error) {
        // Ignore "duplicate column" errors
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('  - Column already exists, skipping');
        } else {
          console.error('  ✗ Error:', error.message);
        }
      }
    }
    
    // Migrate existing data: copy description to textPrompt
    console.log('\nMigrating existing data...');
    try {
      await connection.execute(`
        UPDATE projects 
        SET textPrompt = description, inputType = 'text' 
        WHERE textPrompt IS NULL AND description IS NOT NULL
      `);
      console.log('  ✓ Migrated description to textPrompt');
    } catch (error) {
      console.log('  - Data migration skipped:', error.message);
    }
    
    // Copy sketchUrl to imageUrls as JSON array
    try {
      await connection.execute(`
        UPDATE projects 
        SET imageUrls = CONCAT('["', sketchUrl, '"]'), 
            imageKeys = CONCAT('["', sketchKey, '"]'),
            inputType = 'single_image'
        WHERE imageUrls IS NULL AND sketchUrl IS NOT NULL
      `);
      console.log('  ✓ Migrated sketchUrl to imageUrls');
    } catch (error) {
      console.log('  - Sketch migration skipped:', error.message);
    }
    
    console.log('\nMigration completed!');
  } finally {
    await connection.end();
  }
}

migrate().catch(console.error);
