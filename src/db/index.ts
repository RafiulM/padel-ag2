import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// This is required to make sure the path is resolved correctly 
// when running the Next.js app in development or production.
const dbPath = path.join(process.cwd(), 'sqlite.db');

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
