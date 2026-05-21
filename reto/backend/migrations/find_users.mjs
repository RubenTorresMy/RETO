import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(import.meta.dirname, '../.env') });

const term = process.argv[2];

if (!term) {
  console.error('Usage: node migrations/find_users.mjs <search-term>');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const result = await pool.query(
    `SELECT id_usuario, nombre_usuario, email, rol
     FROM usuario
     WHERE nombre_usuario ILIKE $1 OR email ILIKE $1
     ORDER BY id_usuario`,
    [`%${term}%`]
  );

  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exit(1);
});
