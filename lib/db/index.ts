import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// 빌드 타임에 DATABASE_URL이 없어도 모듈 초기화가 실패하지 않도록 fallback 적용
// 실제 쿼리 실행은 런타임에 .env.local의 DATABASE_URL로 이루어짐
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://build:build@build.neon.tech/build?sslmode=require'

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
