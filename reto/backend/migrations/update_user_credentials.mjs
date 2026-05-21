import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(import.meta.dirname, '../.env') });

const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!name || !email || !password) {
  console.error('Usage: node migrations/update_user_credentials.mjs <nombre_usuario> <email> <password>');
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
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `UPDATE usuario
     SET email = $1, password = $2, rol = 'worker'
     WHERE nombre_usuario = $3
     RETURNING id_usuario, nombre_usuario, email, rol`,
    [email, hashedPassword, name]
  );

  console.log(JSON.stringify({ updated: result.rowCount, rows: result.rows }, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exit(1);
});
