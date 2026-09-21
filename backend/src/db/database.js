import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../digital_heroes.db');
const db = new Database(dbPath);

// Enable foreign keys and Write-Ahead Logging for speed & reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables if they don't exist
const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Initialize default system settings if missing
const checkSetting = db.prepare('SELECT value FROM system_settings WHERE key = ?');
const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');

if (!checkSetting.get('jackpot_rollover')) {
  insertSetting.run('jackpot_rollover', '1250000.00'); // Starting seed jackpot (₹12,50,000)
}
if (!checkSetting.get('prize_pool_percentage')) {
  insertSetting.run('prize_pool_percentage', '50.0'); // 50% of subscription revenue to prize pool
}

export default db;
