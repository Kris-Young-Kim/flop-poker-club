import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://build:build@build.neon.tech/build?sslmode=require',
})

export const db = drizzle(pool, { schema })
