import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

async function runSingleMigration() {
  const filename = process.argv[2];

  if (!filename) {
    console.error('Please provide migration filename');
    process.exit(1);
  }

  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`🔄 Running migration: ${filename}\n`);

  try {
    await pool.query(sql);
    console.log(`✅ ${filename} completed successfully!`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error running ${filename}:`, error);
    process.exit(1);
  }
}

runSingleMigration();
