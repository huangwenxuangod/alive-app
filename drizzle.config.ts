import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// 优先加载 .env.local，其次 .env
config({ path: '.env.local' });
config({ path: '.env' });

// Neon 注意：
// - 应用运行时使用 DATABASE_URL（Pooled connection，带 -pooler）
// - 迁移工具使用 DIRECT_DATABASE_URL（直连，不带 -pooler）
//   因为 Drizzle Kit 的 schema push 不支持 PgBouncer 事务池模式
const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL or DIRECT_DATABASE_URL is not set. ' +
    'For Neon, use DIRECT_DATABASE_URL for migrations (direct connection without pooler).'
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: databaseUrl,
  },
  // Neon 使用 SSL，确保开启
  // 注意：连接字符串中已有 sslmode=require 时这里不需要额外配置
});
