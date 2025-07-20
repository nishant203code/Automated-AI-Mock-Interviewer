import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
    throw new Error('Database connection URL not found in environment variables');
}

let db;

try {
    const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
    db = drizzle(sql, { schema });
} catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
}

export { db };
