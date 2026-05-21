import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(import.meta.dirname, '../.env') });

const name = process.argv[2];

if (!name) {
  console.error('Usage: node migrations/set_worker_role.mjs <nombre_usuario>');
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
    "UPDATE usuario SET rol = 'worker' WHERE nombre_usuario = $1 RETURNING id_usuario, nombre_usuario, email, rol",
    [name]
  );

  console.log(JSON.stringify({ updated: result.rowCount, rows: result.rows }, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exit(1);
});
