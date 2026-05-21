import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log("Ejecutando migración de imágenes...");

    // Añadir columna imagen si no existe
    await pool.query(`ALTER TABLE producto ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);`);

    // Updates de productos existentes
    const productUpdates = [
      { id: 1, url: 'https://example.com/img/spain_flag.jpg' },
      { id: 2, url: 'https://example.com/img/canvas_banner.jpg' },
      { id: 3, url: 'https://example.com/img/andalusia_flag.jpg' },
      { id: 4, url: 'https://example.com/img/large_canvas.jpg' },
      { id: 5, url: 'https://example.com/img/eu_flag.jpg' },
      { id: 6, url: 'https://example.com/img/trade_fair.jpg' },
      { id: 7, url: 'https://example.com/img/valencia_flag.jpg' },
      { id: 8, url: 'https://example.com/img/interior_canvas.jpg' },
      { id: 9, url: 'https://example.com/img/catalonia_flag.jpg' },
      { id: 10, url: 'https://example.com/img/outdoor_canvas.jpg' }
    ];

    for (const update of productUpdates) {
      await pool.query('UPDATE producto SET imagen = $1 WHERE id_producto = $2', [update.url, update.id]);
    }

    // Nuevos productos con banderas
    const newProducts = [
      { id: 11, name: 'Bandera de Francia', desc: 'Bandera nacional de Francia', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg' },
      { id: 12, name: 'Bandera de Alemania', desc: 'Bandera nacional de Alemania', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg' },
      { id: 13, name: 'Bandera de Italia', desc: 'Bandera nacional de Italia', url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg' },
      { id: 14, name: 'Bandera de Portugal', desc: 'Bandera nacional de Portugal', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg' },
      { id: 15, name: 'Bandera del Reino Unido', desc: 'Bandera nacional del Reino Unido', url: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg' },
      { id: 16, name: 'Bandera de Estados Unidos', desc: 'Bandera nacional de Estados Unidos', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Flag_of_the_United_States_%28Pantone%29.svg' },
      { id: 17, name: 'Bandera de Canadá', desc: 'Bandera nacional de Canadá', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg' },
      { id: 18, name: 'Bandera de México', desc: 'Bandera nacional de México', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg' },
      { id: 19, name: 'Bandera de Argentina', desc: 'Bandera nacional de Argentina', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg' }
    ];

    for (const product of newProducts) {
      await pool.query('INSERT INTO producto (id_producto, nombre, descripcion, imagen) VALUES ($1, $2, $3, $4)', [product.id, product.name, product.desc, product.url]);
    }

    // Updates de diseños
    const designUpdates = [
      { id: 1, url: 'https://img.freepik.com/vector-gratis/fondo-decorativo-bandera-fiesta-diseno-confeti_1017-44172.jpg?semt=ais_hybrid&w=740&q=80' },
      { id: 2, url: 'https://es.pngtree.com/free-backgrounds-photos/promoci%C3%B3n-de-eventos-corporativos' },
      { id: 3, url: 'https://www.freepik.es/fotos-vectores-gratis/fondo-pantalla-campana-reciclaje' },
      { id: 4, url: 'https://img.freepik.com/vector-gratis/fondo-minimalista-diseno-plano_23-2149987673.jpg' },
      { id: 5, url: 'https://image.slidesdocs.com/responsive-images/background/summer-paper-cut-beach-cartoon-blue-dabble-nature-powerpoint-background_929749e932__960_540.jpg' },
      { id: 6, url: 'https://img.magnific.com/vector-gratis/fondo-niebla-dinamico-realista_23-2149111508.jpg?semt=ais_hybrid&w=740&q=80' },
      { id: 7, url: 'https://pixabay.com/get/gd8f34a1e741a30737105b45b1c21cb59292384ff7f5d47dfbe3eb859c6d5bcc9c848e023a0e71d2ed94e48376c949e06_1920.png' },
      { id: 8, url: 'https://static.vecteezy.com/system/resources/previews/009/007/075/non_2x/elegant-abstract-background-for-graphic-or-web-design-that-will-make-your-designs-look-professional-vector.jpg' },
      { id: 9, url: 'https://pixabay.com/get/g4163935d99f1aad7317de41e487bb2185136906797636e17558e1145a6ed21d6df396052eede8bc11e4760df94e0434f_1920.jpg' },
      { id: 10, url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtnnBdWPkddZqSuE2tc11bq6lr0PRLlihQmQ&s' }
    ];

    for (const update of designUpdates) {
      await pool.query('UPDATE diseno SET imagen = $1 WHERE id_diseno = $2', [update.url, update.id]);
    }

    // Update especial para diseno 10
    await pool.query("UPDATE diseno SET texto = 'Premium brand' WHERE id_diseno = 10");

    console.log("Migración completada exitosamente.");
  } catch (error) {
    console.error("Error ejecutando migración:", error);
  } finally {
    await pool.end();
  }
}

runMigration();