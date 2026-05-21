import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: resolve(import.meta.dirname, '../.env') });

const sqlbookPath = process.argv[2];

if (!sqlbookPath) {
  console.error('Usage: node migrations/upsert_disenos_from_sqlbook.mjs <path-to-sqlbook>');
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

const upsertSuffix = `
ON CONFLICT (id_diseno) DO UPDATE SET
  tamano = EXCLUDED.tamano,
  colores = EXCLUDED.colores,
  texto = EXCLUDED.texto,
  imagen = EXCLUDED.imagen,
  id_producto = EXCLUDED.id_producto,
  id_usuario = EXCLUDED.id_usuario,
  precio_personalizacion = EXCLUDED.precio_personalizacion
`;

function toUpsert(statement) {
  return statement.replace(/;\s*$/, `\n${upsertSuffix};`);
}

async function main() {
  const sql = await readFile(sqlbookPath, 'utf8');
  const inserts = sql.match(/INSERT INTO DISENO\s*\([^;]+;/gi) ?? [];
  const disenoInserts = inserts.filter((statement) => /\bid_diseno\b/i.test(statement));

  if (disenoInserts.length === 0) {
    throw new Error('No DISENO inserts found in the SQLBook file.');
  }

  const client = await pool.connect();
  let processed = 0;

  try {
    await client.query('BEGIN');

    for (const statement of disenoInserts) {
      await client.query(toUpsert(statement));
      processed += 1;
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`Upserted ${processed} DISENO rows.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
