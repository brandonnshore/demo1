import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

async function runMigrations() {
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('🔄 Running database migrations...\n');

  for (const file of files) {
    console.log(`Executing: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await pool.query(sql);
      console.log(`✅ ${file} completed\n`);
    } catch (error) {
      console.error(`❌ Error running ${file}:`, error);
      process.exit(1);
    }
  }

  console.log('✅ All migrations completed successfully!');
  process.exit(0);
}

runMigrations();
