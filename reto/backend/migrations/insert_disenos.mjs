import { Pool } from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Each entry: (id_diseno, tamano, colores, texto, imagen, id_usuario, id_producto_fk, precio_personalizacion)
// NOTE: id_usuario and id_producto are mapped to values 1-10 to avoid FK violations
const disenos = [
  [1,  'A2', 'red/yellow',  'Local festival',   'https://img.freepik.com/vector-gratis/fondo-decorativo-bandera-fiesta-diseno-confeti_1017-44172.jpg?semt=ais_hybrid&w=740&q=80', 1,  1,  5.00],
  [2,  'A3', 'blue/white',  'Company event',    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Blue_and_white_banner.jpg/640px-Blue_and_white_banner.jpg', 2,  2,  6.50],
  [3,  'A4', 'green',       'Eco campaign',     'https://img.freepik.com/vector-gratis/fondo-naturaleza-verde_23-2148495580.jpg?w=740', 3,  3,  4.25],
  [4,  'A2', 'black',       'Minimal design',   'https://img.freepik.com/vector-gratis/fondo-minimalista-diseno-plano_23-2149987673.jpg', 4,  4,  3.75],
  [5,  'A3', 'red',         'Summer promo',     'https://image.slidesdocs.com/responsive-images/background/summer-paper-cut-beach-cartoon-blue-dabble-nature-powerpoint-background_929749e932__960_540.jpg', 5,  5,  7.00],
  [6,  'A2', 'blue',        'Concert',          'https://img.freepik.com/vector-gratis/fondo-azul-abstracto_23-2148896776.jpg?w=740', 6,  6,  8.00],
  [7,  'A4', 'green/white', 'Fair design',      'https://img.freepik.com/vector-gratis/fondo-verde-claro-abstracto_23-2148896777.jpg?w=740', 7,  7,  5.25],
  [8,  'A3', 'red/blue',    'Sports event',     'https://static.vecteezy.com/system/resources/previews/009/007/075/non_2x/elegant-abstract-background-for-graphic-or-web-design-that-will-make-your-designs-look-professional-vector.jpg', 8,  8,  6.00],
  [9,  'A2', 'yellow',      'Advertising',      'https://img.freepik.com/vector-gratis/fondo-amarillo-abstracto_23-2148896778.jpg?w=740', 9,  9,  9.50],
  [10, 'A1', 'black/white', 'Photography expo', 'https://img.freepik.com/vector-gratis/fondo-blanco-negro-abstracto_23-2148896779.jpg?w=740', 10, 10, 10.00],
  [11, 'A2', 'red',          null,              'https://img.freepik.com/vector-gratis/fondo-rojo-abstracto_23-2148896780.jpg?w=740', 1,  1,  4.00],
  [12, 'A3', 'blue',         null,              'https://img.freepik.com/vector-gratis/fondo-azul-degradado_23-2148896781.jpg?w=740', 2,  2,  5.50],
  [13, 'A4', 'green',        null,              'https://img.freepik.com/vector-gratis/fondo-verde-degradado_23-2148896782.jpg?w=740', 3,  3,  3.25],
  [14, 'A2', 'black',        null,              'https://img.freepik.com/vector-gratis/fondo-negro-abstracto_23-2148896783.jpg?w=740', 4,  4,  6.00],
  [15, 'A3', 'red/yellow',   null,              'https://img.freepik.com/vector-gratis/fondo-rojo-amarillo-abstracto_23-2148896784.jpg?w=740', 5,  5,  7.25],
  [16, 'A2', 'blue',         null,              'https://img.freepik.com/vector-gratis/fondo-azul-claro-abstracto_23-2148896785.jpg?w=740', 6,  6,  8.50],
  [17, 'A4', 'green/white',  null,              'https://img.freepik.com/vector-gratis/fondo-verde-claro-2_23-2148896786.jpg?w=740', 7,  7,  5.75],
  [18, 'A3', 'red',          null,              'https://img.freepik.com/vector-gratis/fondo-rojo-claro_23-2148896787.jpg?w=740', 8,  8,  6.20],
  [19, 'A2', 'yellow',       null,              'https://img.freepik.com/vector-gratis/fondo-amarillo-claro_23-2148896788.jpg?w=740', 9,  9,  9.00],
  [20, 'A1', 'black/white',  null,              'https://img.freepik.com/vector-gratis/fondo-blanco-negro-claro_23-2148896789.jpg?w=740', 10, 10, 10.50],
  [21, 'A2', 'red',         'Marketing text',   'https://img.freepik.com/vector-gratis/fondo-marketing-rojo_23-2148896790.jpg?w=740', 1,  1,  4.75],
  [22, 'A3', 'blue',        'Social campaign',  'https://img.freepik.com/vector-gratis/fondo-social-azul_23-2148896791.jpg?w=740', 2,  2,  5.25],
  [23, 'A4', 'green',       'Local event',      'https://img.freepik.com/vector-gratis/fondo-evento-verde_23-2148896792.jpg?w=740', 3,  3,  6.00],
  [24, 'A2', 'black',       'Basic design',     'https://img.freepik.com/vector-gratis/fondo-basico-negro_23-2148896793.jpg?w=740', 4,  4,  7.50],
  [25, 'A3', 'yellow',       null,              'https://img.freepik.com/vector-gratis/fondo-amarillo-claro-2_23-2148896794.jpg?w=740', 5,  5,  8.00],
  [26, 'A2', 'red',          null,              'https://img.freepik.com/vector-gratis/fondo-rojo-claro-2_23-2148896795.jpg?w=740', 6,  6,  3.50],
  [27, 'A3', 'blue',         null,              'https://img.freepik.com/vector-gratis/fondo-azul-claro-2_23-2148896796.jpg?w=740', 7,  7,  4.00],
  [28, 'A4', 'green',        null,              'https://img.freepik.com/vector-gratis/fondo-verde-claro-3_23-2148896797.jpg?w=740', 8,  8,  5.00],
  [29, 'A2', 'black',        null,              'https://img.freepik.com/vector-gratis/fondo-negro-claro-2_23-2148896798.jpg?w=740', 9,  9,  6.50],
  [30, 'A3', 'yellow',       null,              'https://img.freepik.com/vector-gratis/fondo-amarillo-claro-3_23-2148896799.jpg?w=740', 10, 10, 7.75],
];

async function run() {
  console.log('🔌 Connecting to AWS RDS...');
  const client = await pool.connect();
  console.log('✅ Connected!\n');

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [id, tamano, colores, texto, imagen, id_usuario, id_producto, precio] of disenos) {
    try {
      await client.query(
        `INSERT INTO diseno (id_diseno, tamano, colores, texto, imagen, id_usuario, id_producto, precio_personalizacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id_diseno) DO NOTHING`,
        [id, tamano, colores, texto, imagen, id_usuario, id_producto, precio]
      );
      console.log(`✅ [${id}] ${texto || colores} → inserted`);
      inserted++;
    } catch (err) {
      // Try with id_usuario=1, id_producto=1 as fallback if FK violation
      if (err.code === '23503') {
        try {
          await client.query(
            `INSERT INTO diseno (id_diseno, tamano, colores, texto, imagen, id_usuario, id_producto, precio_personalizacion)
             VALUES ($1, $2, $3, $4, $5, 1, 1, $6)
             ON CONFLICT (id_diseno) DO NOTHING`,
            [id, tamano, colores, texto, imagen, precio]
          );
          console.log(`⚠️  [${id}] FK fallback used → inserted with id_usuario=1, id_producto=1`);
          inserted++;
        } catch (err2) {
          console.error(`❌ [${id}] Failed even with fallback: ${err2.message}`);
          failed++;
        }
      } else if (err.code === '23505') {
        console.log(`⏭️  [${id}] Already exists → skipped`);
        skipped++;
      } else {
        console.error(`❌ [${id}] Error: ${err.message}`);
        failed++;
      }
    }
  }

  client.release();
  await pool.end();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Inserted : ${inserted}`);
  console.log(`⏭️  Skipped  : ${skipped}`);
  console.log(`❌ Failed   : ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
