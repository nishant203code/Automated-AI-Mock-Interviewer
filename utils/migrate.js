import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const runMigration = async () => {
    if (!process.env.NEXT_PUBLIC_DRIZZLE_DB_URL) {
        throw new Error('Database URL not found in environment variables');
    }

    try {
        console.log('Connecting to database...');
        const sql = neon(process.env.NEXT_PUBLIC_DRIZZLE_DB_URL);
        const db = drizzle(sql);

        console.log('Running migrations...');
        await migrate(db, { migrationsFolder: './drizzle' });
        
        console.log('Database migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error(' Migration failed:', error);
        process.exit(1);
    }
};

runMigration();