import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * 数据库单例
 *
 * Neon 最佳实践：
 * - 生产环境使用 Pooled connection（带 -pooler 后缀的 DATABASE_URL）
 * - 确保连接字符串包含 sslmode=require
 * - prepare: false（PgBouncer 事务池模式不支持 prepared statements）
 * - 较短的空闲超时（Neon serverless 自动扩缩容）
 */
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  // Neon Serverless PostgreSQL 配置
  const client = postgres(connectionString, {
    prepare: false, // 兼容 PgBouncer 事务池模式
    max: 10, // 连接池大小
    idle_timeout: 30, // 30 秒空闲超时
    connect_timeout: 10, // 10 秒连接超时
  });

  db = drizzle(client, { schema });
  return db;
}

/**
 * 测试数据库连接
 */
export async function testDbConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
