import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
dotenv.config();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
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
const flagProducts = [
    ["Spain", "https://flagcdn.com/w320/es.png"],
    ["France", "https://flagcdn.com/w320/fr.png"],
    ["Germany", "https://flagcdn.com/w320/de.png"],
    ["Italy", "https://flagcdn.com/w320/it.png"],
    ["Portugal", "https://flagcdn.com/w320/pt.png"],
    ["United Kingdom", "https://flagcdn.com/w320/gb.png"],
    ["United States", "https://flagcdn.com/w320/us.png"],
    ["Canada", "https://flagcdn.com/w320/ca.png"],
    ["Mexico", "https://flagcdn.com/w320/mx.png"],
    ["Argentina", "https://flagcdn.com/w320/ar.png"],
    ["Brazil", "https://flagcdn.com/w320/br.png"],
    ["Chile", "https://flagcdn.com/w320/cl.png"],
    ["Colombia", "https://flagcdn.com/w320/co.png"],
    ["Peru", "https://flagcdn.com/w320/pe.png"],
    ["Uruguay", "https://flagcdn.com/w320/uy.png"],
    ["Paraguay", "https://flagcdn.com/w320/py.png"],
    ["Bolivia", "https://flagcdn.com/w320/bo.png"],
    ["Venezuela", "https://flagcdn.com/w320/ve.png"],
    ["Ecuador", "https://flagcdn.com/w320/ec.png"],
    ["Costa Rica", "https://flagcdn.com/w320/cr.png"],
    ["Japan", "https://flagcdn.com/w320/jp.png"],
    ["China", "https://flagcdn.com/w320/cn.png"],
    ["South Korea", "https://flagcdn.com/w320/kr.png"],
    ["India", "https://flagcdn.com/w320/in.png"],
    ["Pakistan", "https://flagcdn.com/w320/pk.png"],
    ["Indonesia", "https://flagcdn.com/w320/id.png"],
    ["Vietnam", "https://flagcdn.com/w320/vn.png"],
    ["Thailand", "https://flagcdn.com/w320/th.png"],
    ["Philippines", "https://flagcdn.com/w320/ph.png"],
    ["Australia", "https://flagcdn.com/w320/au.png"],
    ["New Zealand", "https://flagcdn.com/w320/nz.png"],
    ["South Africa", "https://flagcdn.com/w320/za.png"],
    ["Egypt", "https://flagcdn.com/w320/eg.png"],
    ["Morocco", "https://flagcdn.com/w320/ma.png"],
    ["Nigeria", "https://flagcdn.com/w320/ng.png"],
    ["Kenya", "https://flagcdn.com/w320/ke.png"],
    ["Turkey", "https://flagcdn.com/w320/tr.png"],
    ["Saudi Arabia", "https://flagcdn.com/w320/sa.png"],
    ["Israel", "https://flagcdn.com/w320/il.png"],
    ["United Arab Emirates", "https://flagcdn.com/w320/ae.png"],
    ["Russia", "https://flagcdn.com/w320/ru.png"],
    ["Ukraine", "https://flagcdn.com/w320/ua.png"],
    ["Poland", "https://flagcdn.com/w320/pl.png"],
    ["Sweden", "https://flagcdn.com/w320/se.png"],
    ["Norway", "https://flagcdn.com/w320/no.png"],
    ["Finland", "https://flagcdn.com/w320/fi.png"],
    ["Denmark", "https://flagcdn.com/w320/dk.png"],
    ["Netherlands", "https://flagcdn.com/w320/nl.png"],
    ["Belgium", "https://flagcdn.com/w320/be.png"],
    ["Switzerland", "https://flagcdn.com/w320/ch.png"]
].map(([name, image], index) => ({
    id_producto: index + 1,
    nombre: `Flag of ${name}`,
    descripcion: "Premium flag ready to personalize and buy in multiple sizes.",
    precio_base: 10,
    tipo_producto: "FLAG",
    publico: true,
    imagen: image
}));
const designPoints = new Map();
function getSizePrice(size) {
    const normalized = String(size || "").toLowerCase();
    if (["small", "pequena", "pequeno", "pequeña", "pequeño", "a4"].includes(normalized))
        return 7;
    if (["medium", "mediana", "mediano", "a3"].includes(normalized))
        return 10;
    if (["large", "grande", "a2"].includes(normalized))
        return 15;
    if (["x-large", "personalizable", "custom", "a1"].includes(normalized))
        return 20;
    return 10;
}
async function ensureFlagCatalog() {
    try {
        for (const product of flagProducts) {
            await pool.query(`INSERT INTO producto (id_producto, nombre, descripcion, precio_base, tipo_producto, publico, imagen)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_producto) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           descripcion = EXCLUDED.descripcion,
           precio_base = EXCLUDED.precio_base,
           tipo_producto = EXCLUDED.tipo_producto,
           publico = EXCLUDED.publico,
           imagen = EXCLUDED.imagen`, [
                product.id_producto,
                product.nombre,
                product.descripcion,
                product.precio_base,
                product.tipo_producto,
                product.publico,
                product.imagen
            ]);
        }
    }
    catch (error) {
        console.warn("Could not sync the flag catalog; fallback to virtual catalog.", error);
    }
}
async function ensureProfileFeatureTables() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS diseno_favorito (
        id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        id_diseno INT NOT NULL REFERENCES diseno(id_diseno) ON DELETE CASCADE,
        fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_usuario, id_diseno)
      )
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS diseno_like (
        id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        id_diseno INT NOT NULL REFERENCES diseno(id_diseno) ON DELETE CASCADE,
        fecha_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_usuario, id_diseno)
      )
    `);
    }
    catch (error) {
        console.warn("Could not ensure profile feature tables.", error);
    }
}
// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middlewares
app.use(cors());
app.use(express.json());
// Servir archivos estáticos del frontend
const frontendPath = path.resolve(__dirname, path.basename(__dirname) === "dist" ? "../../frontend/src" : "../frontend/src");
app.use(express.static(frontendPath));
app.get("/api/ping-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS now");
        res.json({ success: true, time: result.rows[0].now });
    }
    catch (error) {
        console.error("DB ping error:", error);
        res.status(500).json({ success: false, error: "Error connecting to database" });
    }
});
app.get("/api/usuarios", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuario ORDER BY id_usuario");
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: "Error fetching users" });
    }
});
app.get("/api/pedidos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM pedido ORDER BY id_pedido");
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, error: "Error fetching orders" });
    }
});
app.get("/api/productos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM producto ORDER BY id_producto");
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, error: "Error fetching products" });
    }
});
app.get("/api/compras", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM compra ORDER BY id_compra");
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching purchases:", error);
        res.status(500).json({ success: false, error: "Error fetching purchases" });
    }
});
app.get("/api/disenos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM diseno ORDER BY id_diseno");
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching designs:", error);
        res.status(500).json({ success: false, error: "Error fetching designs" });
    }
});
// ============================================
// RUTAS DE API - AUTENTICACIÓN
// ============================================
// Middleware para verificar token JWT
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, error: "Token not provided" });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.rol ?? "user";
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, error: "Invalid token" });
    }
}
function requireWorker(req, res, next) {
    const userRole = req.userRole;
    if (userRole !== "worker") {
        res.status(403).json({ success: false, error: "Worker role required" });
        return;
    }
    next();
}
// Registro
app.post("/api/auth/register", async (req, res) => {
    try {
        const { nombre_usuario, email, password } = req.body;
        if (!nombre_usuario || !email || !password) {
            res.status(400).json({ success: false, error: "All fields are required" });
            return;
        }
        // Check if user already exists
        const existingUser = await pool.query("SELECT * FROM usuario WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ success: false, error: "Email is already registered" });
            return;
        }
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Obtener el siguiente ID
        const maxIdResult = await pool.query("SELECT MAX(id_usuario) as max_id FROM usuario");
        const nextId = (maxIdResult.rows[0].max_id || 0) + 1;
        // Insertar nuevo usuario
        const result = await pool.query("INSERT INTO usuario (id_usuario, nombre_usuario, email, password, fecha_registro, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario, nombre_usuario, email, fecha_registro, rol", [nextId, nombre_usuario, email, hashedPassword, new Date().toISOString().split('T')[0], "user"]);
        // Generar token
        const token = jwt.sign({ id: result.rows[0].id_usuario, email }, JWT_SECRET, { expiresIn: "24h" });
        res.json({
            success: true,
            message: "Registro exitoso",
            token,
            user: {
                ...result.rows[0],
                rol: result.rows[0].rol ?? "user"
            }
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, error: "Registration error" });
    }
});
// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, error: "Email and password are required" });
            return;
        }
        if (email === "admin@demo.com" && password === "admin123") {
            let demoUserId = 0;
            try {
                const existingDemo = await pool.query("SELECT id_usuario FROM usuario WHERE email = $1", [email]);
                if (existingDemo.rows.length > 0) {
                    demoUserId = existingDemo.rows[0].id_usuario;
                }
                else {
                    const passwordHash = await bcrypt.hash(password, 10);
                    const maxIdResult = await pool.query("SELECT MAX(id_usuario) AS max_id FROM usuario");
                    demoUserId = (maxIdResult.rows[0]?.max_id || 0) + 1;
                    const insertedDemo = await pool.query("INSERT INTO usuario (id_usuario, nombre_usuario, email, password, fecha_registro, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario", [demoUserId, "Admin Demo", email, passwordHash, new Date().toISOString().split("T")[0], "worker"]);
                    demoUserId = insertedDemo.rows[0].id_usuario;
                }
            }
            catch (error) {
                console.warn("No se pudo sincronizar el usuario demo con la BD; se usara sesion demo temporal.", error);
            }
            const demoUser = {
                id: demoUserId,
                nombre_usuario: "Admin Demo",
                email: "admin@demo.com",
                rol: "worker"
            };
            const token = jwt.sign({ id: demoUser.id, email: demoUser.email, rol: demoUser.rol, demo: true }, JWT_SECRET, { expiresIn: "24h" });
            res.json({ success: true, message: "Login demo exitoso", token, user: demoUser });
            return;
        }
        // Buscar usuario
        const result = await pool.query("SELECT * FROM usuario WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        const user = result.rows[0];
        // Verificar contraseña
        if (!user.password) {
            res.status(401).json({ success: false, error: "This user has no password configured yet" });
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        // Generate token
        const token = jwt.sign({ id: user.id_usuario, email: user.email, rol: user.rol ?? "user" }, JWT_SECRET, { expiresIn: "24h" });
        res.json({
            success: true,
            message: "Login exitoso",
            token,
            user: {
                id: user.id_usuario,
                nombre_usuario: user.nombre_usuario,
                email: user.email,
                rol: user.rol ?? "user"
            }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: "Login error" });
    }
});
// Verificar usuario autenticado
app.get("/api/auth/me", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query("SELECT id_usuario, nombre_usuario, email, fecha_registro, rol FROM usuario WHERE id_usuario = $1", [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.json({
            success: true,
            user: {
                id: result.rows[0].id_usuario,
                nombre_usuario: result.rows[0].nombre_usuario,
                email: result.rows[0].email,
                fecha_registro: result.rows[0].fecha_registro,
                rol: result.rows[0].rol ?? "user"
            }
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, error: "Error fetching user" });
    }
});
// ============================================
// RUTAS DE API - PRODUCTOS
// ============================================
function formatProduct(row) {
    const rawPrice = row.precio_base ?? row.precio ?? row.price ?? 0;
    const numericPrice = Number.parseFloat(rawPrice);
    const name = row.nombre ?? row.name ?? "Producto";
    const price = Number.isFinite(numericPrice) ? numericPrice : 0;
    return {
        id: row.id_producto ?? row.id,
        name,
        description: row.descripcion ?? row.description ?? "",
        price: Number.isFinite(numericPrice) ? `${numericPrice.toFixed(0)}€` : String(rawPrice),
        basePrice: price,
        category: ['FLAG', 'BANDERA'].includes(row.tipo_producto) ? 'flags' : 'canvas',
        type: row.tipo_producto ?? row.type,
        publico: row.publico,
        image: getCatalogImage(getRawImage(row), name)
    };
}
function getRawImage(row) {
    return row?.imagen ?? row?.image ?? row?.image_url ?? row?.url_imagen ?? row?.portada ?? row?.cover_image;
}
function isRenderableImage(value) {
    return typeof value === "string" && /^(https?:\/\/|data:image\/)/i.test(value);
}
function getCatalogImage(value, fallbackText) {
    if (isRenderableImage(value)) {
        return value;
    }
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(fallbackText)}`;
}
function escapeSvgText(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function normalizeCssColor(value, fallback) {
    if (!value)
        return fallback;
    const color = value.trim().toLowerCase();
    if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color) || /^[a-z]+$/i.test(color)) {
        return color;
    }
    return fallback;
}
function createDesignCover(row, name) {
    const colors = String(row.colores ?? "").split(/[\/,]/);
    const firstColor = normalizeCssColor(colors[0], "#d62828");
    const secondColor = normalizeCssColor(colors[1], "#fcbf49");
    const title = escapeSvgText(row.texto || name);
    const size = escapeSvgText(row.tamano || "Custom");
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${firstColor}"/>
      <rect y="150" width="400" height="150" fill="${secondColor}"/>
      <rect x="32" y="36" width="336" height="228" rx="10" fill="rgba(255,255,255,0.84)"/>
      <text x="200" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111">${title}</text>
      <text x="200" y="176" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#333">${size}</text>
    </svg>
  `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function formatDesign(row) {
    const rawPrice = row.precio_personalizacion ?? row.precio ?? 0;
    const numericPrice = Number.parseFloat(rawPrice);
    const price = Number.isFinite(numericPrice) ? numericPrice : 0;
    const name = row.texto ? `Diseño: ${row.texto}` : `Diseño #${row.id_diseno}`;
    const designImage = getRawImage(row);
    const productImage = getRawImage(row.producto);
    const image = isRenderableImage(designImage)
        ? designImage
        : isRenderableImage(productImage)
            ? productImage
            : createDesignCover(row, name);
    const details = [
        row.tamano ? `Tamaño ${row.tamano}` : null,
        row.colores ? `Colores: ${row.colores}` : null
    ].filter(Boolean).join(" · ");
    const likes = Number(row.like_count ?? row.likes ?? 0) || 0;
    const saves = Number(row.save_count ?? row.saves ?? 0) || 0;
    return {
        id: `design-${row.id_diseno}`,
        designId: row.id_diseno,
        productId: row.id_producto,
        ownerId: row.id_usuario,
        name,
        description: details || "Diseño personalizado",
        price: Number.isFinite(numericPrice) ? `${numericPrice.toFixed(0)}€` : String(rawPrice),
        basePrice: price,
        category: "designs",
        type: "DESIGN",
        image: getCatalogImage(image, name),
        publicName: row.nombre_publicacion ?? row.public_name ?? name,
        tags: row.etiquetas ?? row.tags ?? "",
        likes,
        saves,
        points: designPoints.get(Number(row.id_diseno)) || Number(row.puntos ?? 0) || (likes * 10) || 0
    };
}
function formatSaleItem(item, index) {
    const discount = index % 3 === 0 ? 30 : index % 3 === 1 ? 20 : 15;
    const basePrice = Number(item.basePrice ?? 0);
    const salePrice = basePrice > 0 ? Number((basePrice * (1 - discount / 100)).toFixed(2)) : 0;
    return {
        ...item,
        originalPrice: item.price,
        discount,
        salePrice,
        price: `$${salePrice.toFixed(2)}`
    };
}
function buildProductQuery(category) {
    const normalized = (category || '').toLowerCase();
    if (['bandera', 'flags', 'best-sold'].includes(normalized)) {
        return {
            query: "SELECT * FROM producto WHERE UPPER(tipo_producto::text) IN ('FLAG', 'BANDERA') ORDER BY id_producto",
            params: []
        };
    }
    if (['lona', 'blank', 'custom', 'no-publico'].includes(normalized)) {
        return {
            query: "SELECT * FROM producto WHERE UPPER(tipo_producto::text) IN ('CANVAS', 'LONA') ORDER BY id_producto",
            params: []
        };
    }
    return {
        query: 'SELECT * FROM producto ORDER BY id_producto',
        params: []
    };
}
async function getCatalogItems(category) {
    const normalized = (category || '').toLowerCase();
    if (['diseno', 'disenos', 'diseño', 'diseños', 'design', 'designs'].includes(normalized)) {
        const designs = await pool.query(`
      SELECT d.*, row_to_json(p) AS producto
      FROM diseno d
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      ORDER BY d.id_diseno
    `);
        return designs.rows.map(formatDesign);
    }
    const { query, params } = buildProductQuery(category);
    const products = await pool.query(query, params);
    if (normalized) {
        return products.rows.map(formatProduct);
    }
    const designs = await pool.query(`
    SELECT d.*, row_to_json(p) AS producto
    FROM diseno d
    LEFT JOIN producto p ON p.id_producto = d.id_producto
    ORDER BY d.id_diseno
  `);
    return [
        ...products.rows.map(formatProduct),
        ...designs.rows.map(formatDesign)
    ];
}
async function getModernCatalogItems(category) {
    const normalized = (category || "").toLowerCase();
    const virtualProducts = flagProducts.map(formatProduct);
    if (["diseno", "disenos", "diseño", "diseños", "design", "designs"].includes(normalized)) {
        try {
            const designs = await pool.query(`
        SELECT d.*, row_to_json(p) AS producto
        FROM diseno d
        LEFT JOIN producto p ON p.id_producto = d.id_producto
        ORDER BY d.id_diseno
      `);
            return designs.rows.map(formatDesign);
        }
        catch (error) {
            console.warn("No se pudieron cargar disenos publicados.", error);
            return [];
        }
    }
    if (normalized) {
        return normalized === "canvas" || normalized === "lona" ? [] : virtualProducts;
    }
    try {
        const designs = await pool.query(`
      SELECT d.*, row_to_json(p) AS producto
      FROM diseno d
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      ORDER BY d.id_diseno
    `);
        return [...virtualProducts, ...designs.rows.map(formatDesign)];
    }
    catch (error) {
        console.warn("No se pudieron cargar disenos publicados para el catalogo.", error);
        return virtualProducts;
    }
}
app.get("/api/products", async (req, res) => {
    try {
        const category = (req.query.category ?? '').toString();
        const items = await getModernCatalogItems(category);
        res.json({ success: true, data: items });
    }
    catch (error) {
        console.error("Error fetching products from DB:", error);
        res.status(500).json({ success: false, error: "Error fetching products" });
    }
});
app.get("/api/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query("SELECT id_usuario, nombre_usuario, email, fecha_registro, rol FROM usuario WHERE id_usuario = $1", [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        const user = result.rows[0];
        res.json({
            success: true,
            data: {
                id: user.id_usuario,
                nombre_usuario: user.nombre_usuario,
                email: user.email,
                fecha_registro: user.fecha_registro,
                rol: user.rol ?? "user"
            }
        });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, error: "Error fetching profile" });
    }
});
app.post("/api/profile/password", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || String(newPassword).length < 6) {
            res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
            return;
        }
        const result = await pool.query("SELECT password FROM usuario WHERE id_usuario = $1", [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        const existingPassword = result.rows[0].password;
        if (existingPassword) {
            const validCurrentPassword = await bcrypt.compare(currentPassword || "", existingPassword);
            if (!validCurrentPassword) {
                res.status(400).json({ success: false, error: "Current password is not correct" });
                return;
            }
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE usuario SET password = $1 WHERE id_usuario = $2", [hashedPassword, userId]);
        res.json({ success: true, message: "Password updated" });
    }
    catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ success: false, error: "Error changing password" });
    }
});
app.get("/api/profile/orders", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query(`
      SELECT
        p.id_pedido,
        p.fecha_pedido,
        p.estado_pedido,
        COALESCE(productos.items, '[]'::json) AS productos,
        COALESCE(disenos.items, '[]'::json) AS disenos
      FROM pedido p
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'id', pr.id_producto,
          'name', pr.nombre,
          'quantity', i.cantidad,
          'price', pr.precio_base
        )) AS items
        FROM incluir i
        JOIN producto pr ON pr.id_producto = i.id_producto
        WHERE i.id_pedido = p.id_pedido
      ) productos ON true
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'id', d.id_diseno,
          'name', COALESCE(d.texto, 'Diseño #' || d.id_diseno),
          'quantity', i2.cantidad,
          'price', d.precio_personalizacion
        )) AS items
        FROM incluir2 i2
        JOIN diseno d ON d.id_diseno = i2.id_diseno
        WHERE i2.id_pedido = p.id_pedido
      ) disenos ON true
      WHERE p.id_usuario = $1
      ORDER BY p.fecha_pedido DESC, p.id_pedido DESC
    `, [userId]);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching profile orders:", error);
        res.status(500).json({ success: false, error: "Error fetching orders" });
    }
});
app.get("/api/profile/designs", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query(`
      SELECT d.*, row_to_json(p) AS producto
      FROM diseno d
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      WHERE d.id_usuario = $1
      ORDER BY d.id_diseno DESC
    `, [userId]);
        res.json({
            success: true,
            data: result.rows.map(formatDesign)
        });
    }
    catch (error) {
        console.error("Error fetching user designs:", error);
        res.status(500).json({ success: false, error: "Error fetching user designs" });
    }
});
app.get("/api/catalog", async (req, res) => {
    try {
        const category = (req.query.category ?? '').toString();
        const items = await getModernCatalogItems(category);
        res.json({ success: true, data: items });
    }
    catch (error) {
        console.error("Error fetching catalog from DB:", error);
        res.status(500).json({ success: false, error: "Error fetching catalog" });
    }
});
app.get("/api/sale", async (req, res) => {
    try {
        const items = await getModernCatalogItems("");
        const saleItems = items
            .filter((item) => Number(item.basePrice ?? 0) > 0)
            .filter((_, index) => index % 2 === 0)
            .map(formatSaleItem);
        res.json({ success: true, data: saleItems });
    }
    catch (error) {
        console.error("Error fetching sale items:", error);
        res.status(500).json({ success: false, error: "Error fetching offers" });
    }
});
app.get("/api/products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const virtualProduct = flagProducts.find((product) => product.id_producto === id);
        if (virtualProduct) {
            res.json({ success: true, data: formatProduct(virtualProduct) });
            return;
        }
        const result = await pool.query('SELECT * FROM producto WHERE id_producto = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Product not found' });
            return;
        }
        res.json({ success: true, data: formatProduct(result.rows[0]) });
    }
    catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ success: false, error: 'Error fetching product' });
    }
});
const intranetFlags = flagProducts.map((product) => ({
    id: product.id_producto,
    name: product.nombre,
    image: product.imagen,
    category: product.tipo_producto,
    price: product.precio_base
}));
const userComplaints = [
    {
        id: 1,
        userEmail: 'customer1@example.com',
        subject: 'Missing flag customization option',
        details: 'I could not choose a custom size for my order.',
        status: 'Open',
        createdAt: '2026-05-15T09:40:00Z'
    },
    {
        id: 2,
        userEmail: 'customer2@example.com',
        subject: 'Late delivery notice',
        details: 'The shipment tracking did not update after 3 days.',
        status: 'In review',
        createdAt: '2026-05-16T14:12:00Z'
    },
    {
        id: 3,
        userEmail: 'customer3@example.com',
        subject: 'Incorrect flag design received',
        details: 'The flag colors did not match the preview image.',
        status: 'Resolved',
        createdAt: '2026-05-17T18:05:00Z'
    }
];
app.get('/api/intranet/flags', verifyToken, requireWorker, (req, res) => {
    res.json({ success: true, data: intranetFlags });
});
app.delete('/api/intranet/flags/:id', verifyToken, requireWorker, (req, res) => {
    const id = Number(req.params.id);
    const index = intranetFlags.findIndex((flag) => flag.id === id);
    if (index === -1) {
        res.status(404).json({ success: false, error: 'Flag not found' });
        return;
    }
    intranetFlags.splice(index, 1);
    res.json({ success: true, message: 'Flag deleted', data: { id } });
});
app.get('/api/intranet/complaints', verifyToken, requireWorker, (req, res) => {
    res.json({ success: true, data: userComplaints });
});
app.post('/api/intranet/complaints', verifyToken, requireWorker, (req, res) => {
    const { userEmail, subject, details } = req.body;
    if (!userEmail || !subject || !details) {
        res.status(400).json({ success: false, error: 'The complaint payload is incomplete' });
        return;
    }
    const nextId = userComplaints.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
    const newComplaint = {
        id: nextId,
        userEmail,
        subject,
        details,
        status: 'Open',
        createdAt: new Date().toISOString()
    };
    userComplaints.push(newComplaint);
    res.json({ success: true, data: newComplaint });
});
app.delete('/api/intranet/complaints/:id', verifyToken, requireWorker, (req, res) => {
    const id = Number(req.params.id);
    const index = userComplaints.findIndex((complaint) => complaint.id === id);
    if (index === -1) {
        res.status(404).json({ success: false, error: 'Complaint not found' });
        return;
    }
    userComplaints.splice(index, 1);
    res.json({ success: true, message: 'Complaint removed', data: { id } });
});
// ============================================
// RUTAS DE API - NEWSLETTER
// ============================================
const subscribers = [];
app.post("/api/newsletter/subscribe", (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, error: "Email es requerido" });
        return;
    }
    if (subscribers.includes(email)) {
        res.status(400).json({ success: false, error: "Este email ya está registrado" });
        return;
    }
    subscribers.push(email);
    console.log(`Nuevo suscriptor: ${email}`);
    res.json({
        success: true,
        message: "Suscripción exitosa",
        email
    });
});
// ============================================
// RUTAS DE API - TESTIMONIO
// ============================================
const mockTestimonials = [
    {
        id: 1,
        rating: 5,
        text: "SUPER VIBRANT AND CUSTOMIZABLE COLORS CAME OUT SUPER VIBRANT AND THE MATERIAL IS HIGH QUALITY.",
        author: "Sarah M.",
        verified: true
    },
    {
        id: 2,
        rating: 5,
        text: "SUPER VIBRANT AND CUSTOMIZABLE COLORS CAME OUT SUPER VIBRANT AND THE MATERIAL IS HIGH QUALITY. SHIPPING WAS FAST AND THE FINAL PRODUCT WAS PERFECT.",
        author: "Alex K.",
        verified: true
    },
    {
        id: 3,
        rating: 5,
        text: "I WAS IMPRESSED BY THE PRINT QUALITY AND ALL ATTENTION TO DETAIL. THE BANNER LOOKS AMAZING AND DELIVERED ON TIME.",
        author: "James L.",
        verified: true
    }
];
app.get("/api/testimonials", (req, res) => {
    res.json({ success: true, data: mockTestimonials });
});
// ============================================
// RUTAS DE DISEÑO (PREPARADAS)
// ============================================
app.get("/api/designs", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        d.*,
        row_to_json(p) AS producto,
        COALESCE(likes.total, 0) AS like_count,
        COALESCE(favorites.total, 0) AS save_count
      FROM diseno d
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      LEFT JOIN (
        SELECT id_diseno, COUNT(*)::int AS total
        FROM diseno_like
        GROUP BY id_diseno
      ) likes ON likes.id_diseno = d.id_diseno
      LEFT JOIN (
        SELECT id_diseno, COUNT(*)::int AS total
        FROM diseno_favorito
        GROUP BY id_diseno
      ) favorites ON favorites.id_diseno = d.id_diseno
      ORDER BY d.id_diseno
    `);
        res.json({
            success: true,
            data: result.rows.map(formatDesign)
        });
    }
    catch (error) {
        console.error("Error fetching designs:", error);
        res.status(500).json({ success: false, error: "Error fetching designs" });
    }
});
app.get("/api/designs/popular", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        d.*,
        row_to_json(p) AS producto,
        COALESCE(likes.total, 0) AS like_count,
        COALESCE(favorites.total, 0) AS save_count
      FROM diseno d
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      LEFT JOIN (
        SELECT id_diseno, COUNT(*)::int AS total
        FROM diseno_like
        GROUP BY id_diseno
      ) likes ON likes.id_diseno = d.id_diseno
      LEFT JOIN (
        SELECT id_diseno, COUNT(*)::int AS total
        FROM diseno_favorito
        GROUP BY id_diseno
      ) favorites ON favorites.id_diseno = d.id_diseno
      ORDER BY (COALESCE(likes.total, 0) * 2 + COALESCE(favorites.total, 0)) DESC,
               d.id_diseno DESC
      LIMIT 12
    `);
        res.json({ success: true, data: result.rows.map(formatDesign) });
    }
    catch (error) {
        console.error("Error fetching popular designs:", error);
        res.status(500).json({ success: false, error: "Error fetching popular designs" });
    }
});
app.get("/api/designs/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await pool.query(`
      SELECT
        d.*,
        row_to_json(p) AS producto,
        COALESCE(likes.total, 0) AS like_count,
        COALESCE(favorites.total, 0) AS save_count
      FROM diseno d
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      LEFT JOIN (
        SELECT id_diseno, COUNT(*)::int AS total
        FROM diseno_like
        GROUP BY id_diseno
      ) likes ON likes.id_diseno = d.id_diseno
      LEFT JOIN (
        SELECT id_diseno, COUNT(*)::int AS total
        FROM diseno_favorito
        GROUP BY id_diseno
      ) favorites ON favorites.id_diseno = d.id_diseno
      WHERE d.id_diseno = $1
    `, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Design not found" });
            return;
        }
        res.json({ success: true, data: formatDesign(result.rows[0]) });
    }
    catch (error) {
        console.error("Error fetching design by ID:", error);
        res.status(500).json({ success: false, error: "Error fetching design" });
    }
});
app.delete("/api/designs/:id", verifyToken, requireWorker, async (req, res) => {
    const client = await pool.connect();
    try {
        const designId = parseInt(req.params.id, 10);
        if (!Number.isFinite(designId)) {
            res.status(400).json({ success: false, error: "Invalid design id" });
            return;
        }
        await client.query("BEGIN");
        const existing = await client.query("SELECT id_diseno FROM diseno WHERE id_diseno = $1", [designId]);
        if (existing.rows.length === 0) {
            await client.query("ROLLBACK");
            res.status(404).json({ success: false, error: "Design not found" });
            return;
        }
        await client.query("DELETE FROM diseno_like WHERE id_diseno = $1", [designId]);
        await client.query("DELETE FROM diseno_favorito WHERE id_diseno = $1", [designId]);
        await client.query("DELETE FROM carrito WHERE id_diseno = $1", [designId]);
        await client.query("DELETE FROM diseno WHERE id_diseno = $1", [designId]);
        await client.query("COMMIT");
        designPoints.delete(designId);
        res.json({ success: true, message: "Bandera eliminada", data: { id: designId } });
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("Error deleting design:", error);
        res.status(500).json({ success: false, error: "Error eliminando bandera" });
    }
    finally {
        client.release();
    }
});
app.post("/api/designs/:id/like", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const designId = parseInt(req.params.id, 10);
        const design = await pool.query("SELECT id_diseno, id_usuario FROM diseno WHERE id_diseno = $1", [designId]);
        if (design.rows.length === 0) {
            res.status(404).json({ success: false, error: "Design not found" });
            return;
        }
        if (Number(design.rows[0].id_usuario) === Number(userId)) {
            res.status(400).json({ success: false, error: "No puedes dar like a tu propio diseÃ±o" });
            return;
        }
        const likeResult = await pool.query("INSERT INTO diseno_like (id_usuario, id_diseno) VALUES ($1, $2) ON CONFLICT (id_usuario, id_diseno) DO NOTHING RETURNING id_diseno", [userId, designId]);
        if (likeResult.rows.length > 0) {
            const points = (designPoints.get(designId) || 0) + 10;
            designPoints.set(designId, points);
        }
        const countResult = await pool.query("SELECT COUNT(*)::int AS likes FROM diseno_like WHERE id_diseno = $1", [designId]);
        res.json({
            success: true,
            liked: true,
            awardedPoints: likeResult.rows.length > 0 ? 10 : 0,
            likes: countResult.rows[0]?.likes || 0,
            points: designPoints.get(designId) || 0
        });
    }
    catch (error) {
        console.error("Error liking design:", error);
        res.status(500).json({ success: false, error: "Error guardando like" });
    }
});
app.delete("/api/designs/:id/like", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const designId = parseInt(req.params.id, 10);
        await pool.query("DELETE FROM diseno_like WHERE id_usuario = $1 AND id_diseno = $2", [userId, designId]);
        const countResult = await pool.query("SELECT COUNT(*)::int AS likes FROM diseno_like WHERE id_diseno = $1", [designId]);
        res.json({ success: true, liked: false, likes: countResult.rows[0]?.likes || 0 });
    }
    catch (error) {
        console.error("Error removing design like:", error);
        res.status(500).json({ success: false, error: "Error eliminando like" });
    }
});
app.get("/api/profile/favorites", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query(`
      SELECT d.*, row_to_json(p) AS producto, f.fecha_guardado
      FROM diseno_favorito f
      JOIN diseno d ON d.id_diseno = f.id_diseno
      LEFT JOIN producto p ON p.id_producto = d.id_producto
      WHERE f.id_usuario = $1
      ORDER BY f.fecha_guardado DESC
    `, [userId]);
        res.json({
            success: true,
            data: result.rows.map((row) => ({
                ...formatDesign(row),
                savedAt: row.fecha_guardado
            }))
        });
    }
    catch (error) {
        console.error("Error fetching favorite designs:", error);
        res.status(500).json({ success: false, error: "Error fetching favorites" });
    }
});
app.post("/api/profile/favorites/:designId", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const designId = parseInt(req.params.designId, 10);
        const design = await pool.query("SELECT id_diseno, id_usuario FROM diseno WHERE id_diseno = $1", [designId]);
        if (design.rows.length === 0) {
            res.status(404).json({ success: false, error: "Design not found" });
            return;
        }
        if (Number(design.rows[0].id_usuario) === Number(userId)) {
            res.status(400).json({ success: false, error: "No puedes guardar tu propio diseño como favorito" });
            return;
        }
        const favoriteResult = await pool.query("INSERT INTO diseno_favorito (id_usuario, id_diseno) VALUES ($1, $2) ON CONFLICT (id_usuario, id_diseno) DO NOTHING RETURNING id_diseno", [userId, designId]);
        let awardedPoints = 0;
        let points = designPoints.get(designId) || 0;
        if (favoriteResult.rows.length > 0) {
            awardedPoints = 10;
            points += awardedPoints;
            designPoints.set(designId, points);
        }
        res.json({
            success: true,
            message: awardedPoints > 0
                ? "Diseño guardado en favoritos. El creador suma puntos para descuentos."
                : "Diseño ya estaba guardado en favoritos",
            awardedPoints,
            points
        });
    }
    catch (error) {
        console.error("Error saving favorite design:", error);
        res.status(500).json({ success: false, error: "Error guardando favorito" });
    }
});
app.get("/api/profile/rewards", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query("SELECT id_diseno FROM diseno WHERE id_usuario = $1", [userId]);
        const points = result.rows.reduce((total, row) => (total + (designPoints.get(Number(row.id_diseno)) || 0)), 0);
        const discountPercent = points >= 300 ? 20 : points >= 150 ? 15 : points >= 50 ? 10 : 0;
        res.json({
            success: true,
            points,
            discountPercent,
            message: "Tus puntos se generan cuando otros usuarios dan like a tus banderas."
        });
    }
    catch (error) {
        console.error("Error fetching rewards:", error);
        res.status(500).json({ success: false, error: "Error fetching rewards" });
    }
});
app.delete("/api/profile/favorites/:designId", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const designId = parseInt(req.params.designId, 10);
        await pool.query("DELETE FROM diseno_favorito WHERE id_usuario = $1 AND id_diseno = $2", [userId, designId]);
        res.json({ success: true, message: "Diseño eliminado de favoritos" });
    }
    catch (error) {
        console.error("Error removing favorite design:", error);
        res.status(500).json({ success: false, error: "Error eliminando favorito" });
    }
});
app.post("/api/designs", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, data, tamano, colores, id_producto, precio_personalizacion, publicar, nombre_publicacion, descripcion_publicacion, etiquetas } = req.body;
        if (!name || !data) {
            res.status(400).json({
                success: false,
                error: "Nombre y datos del diseno son requeridos"
            });
            return;
        }
        const maxIdResult = await pool.query("SELECT MAX(id_diseno) AS max_id FROM diseno");
        const nextId = (maxIdResult.rows[0]?.max_id || 0) + 1;
        const insertResult = await pool.query(`INSERT INTO diseno (
        id_diseno,
        tamano,
        colores,
        texto,
        imagen,
        id_producto,
        id_usuario,
        precio_personalizacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`, [
            nextId,
            tamano || "Large",
            colores || "custom",
            name,
            data,
            id_producto || null,
            userId,
            Number(precio_personalizacion || 0)
        ]);
        const designRow = insertResult.rows[0];
        let productRow = null;
        if (designRow.id_producto) {
            const productResult = await pool.query("SELECT * FROM producto WHERE id_producto = $1", [designRow.id_producto]);
            productRow = productResult.rows[0] || null;
        }
        res.json({
            success: true,
            message: "Diseno guardado",
            data: formatDesign({
                ...designRow,
                producto: productRow,
                publico: Boolean(publicar),
                nombre_publicacion: nombre_publicacion || name,
                descripcion_publicacion: descripcion_publicacion || "",
                etiquetas: Array.isArray(etiquetas) ? etiquetas.join(", ") : (etiquetas || "")
            })
        });
    }
    catch (error) {
        console.error("Error saving design:", error);
        res.status(500).json({ success: false, error: "Error guardando diseno" });
    }
});
app.post("/api/designs", (req, res) => {
    const { name, data, userId } = req.body;
    if (!name || !data) {
        res.status(400).json({
            success: false,
            error: "Nombre y datos del diseño son requeridos"
        });
        return;
    }
    // TODO: Guardar en BD
    res.json({
        success: true,
        message: "Diseño guardado",
        design: { id: 1, name, data, userId }
    });
});
// ============================================
// RUTAS DE API - CARRITO
// ============================================
// Obtener carrito del usuario
app.get("/api/cart", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query(`
      SELECT 
        c.id_carrito,
        c.id_producto,
        c.id_diseno,
        c.cantidad,
        c.tamano,
        c.precio_unitario,
        c.fecha_agregado,
        CASE 
          WHEN c.id_producto IS NOT NULL THEN 
            json_build_object(
              'id', p.id_producto,
              'name', p.nombre,
              'image', p.imagen,
              'basePrice', p.precio_base,
              'type', p.tipo_producto
            )
          ELSE 
            json_build_object(
              'id', d.id_diseno,
              'name', COALESCE(d.texto, 'Diseño #' || d.id_diseno),
              'image', d.imagen,
              'basePrice', d.precio_personalizacion,
              'type', 'DESIGN'
            )
        END AS item
      FROM carrito c
      LEFT JOIN producto p ON c.id_producto = p.id_producto
      LEFT JOIN diseno d ON c.id_diseno = d.id_diseno
      WHERE c.id_usuario = $1
      ORDER BY c.fecha_agregado DESC
    `, [userId]);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, error: "Error fetching cart" });
    }
});
// Agregar producto al carrito
app.post("/api/cart", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id_producto, id_diseno, cantidad, tamano, precio_unitario } = req.body;
        if (!cantidad || !precio_unitario || (!id_producto && !id_diseno)) {
            res.status(400).json({
                success: false,
                error: "Datos incompletos para agregar al carrito"
            });
            return;
        }
        if (id_producto && flagProducts.some((product) => product.id_producto === Number(id_producto))) {
            await ensureFlagCatalog();
        }
        if (id_diseno) {
            const points = (designPoints.get(Number(id_diseno)) || 0) + 10;
            designPoints.set(Number(id_diseno), points);
        }
        // Verificar si el producto/diseño ya existe en el carrito
        const existingResult = await pool.query(`SELECT id_carrito, cantidad FROM carrito 
       WHERE id_usuario = $1 
       AND (id_producto = $2 OR id_diseno = $3)
       AND (COALESCE(tamano, '') = COALESCE($4, ''))`, [userId, id_producto, id_diseno, tamano]);
        if (existingResult.rows.length > 0) {
            // Actualizar cantidad si ya existe
            const cartId = existingResult.rows[0].id_carrito;
            const newQuantity = existingResult.rows[0].cantidad + cantidad;
            const updateResult = await pool.query(`UPDATE carrito SET cantidad = $1 WHERE id_carrito = $2 RETURNING *`, [newQuantity, cartId]);
            res.json({
                success: true,
                message: "Cantidad actualizada",
                data: updateResult.rows[0]
            });
            return;
        }
        // Agregar nuevo item
        const insertResult = await pool.query(`INSERT INTO carrito (id_usuario, id_producto, id_diseno, cantidad, tamano, precio_unitario)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [userId, id_producto || null, id_diseno || null, cantidad, tamano || null, precio_unitario]);
        res.json({
            success: true,
            message: "Producto agregado al carrito",
            data: insertResult.rows[0]
        });
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, error: "Error agregando al carrito" });
    }
});
app.post("/api/designs/:id/reward-use", verifyToken, async (req, res) => {
    const designId = parseInt(req.params.id, 10);
    const points = (designPoints.get(designId) || 0) + 10;
    designPoints.set(designId, points);
    res.json({
        success: true,
        points,
        message: "El creador suma puntos para descuentos, recompensas y ventajas"
    });
});
// Actualizar cantidad en carrito
app.put("/api/cart/:cartId", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const cartId = parseInt(req.params.cartId, 10);
        const { cantidad } = req.body;
        if (!cantidad || cantidad < 1) {
            res.status(400).json({ success: false, error: "Cantidad inválida" });
            return;
        }
        const result = await pool.query(`UPDATE carrito SET cantidad = $1 
       WHERE id_carrito = $2 AND id_usuario = $3
       RETURNING *`, [cantidad, cartId, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Item del carrito no encontrado" });
            return;
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, error: "Error actualizando carrito" });
    }
});
// Eliminar item del carrito
app.delete("/api/cart/:cartId", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const cartId = parseInt(req.params.cartId, 10);
        const result = await pool.query(`DELETE FROM carrito 
       WHERE id_carrito = $1 AND id_usuario = $2
       RETURNING id_carrito`, [cartId, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: "Item del carrito no encontrado" });
            return;
        }
        res.json({ success: true, message: "Item eliminado del carrito" });
    }
    catch (error) {
        console.error("Error deleting from cart:", error);
        res.status(500).json({ success: false, error: "Error eliminando del carrito" });
    }
});
// Vaciar carrito del usuario
app.delete("/api/cart", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        await pool.query(`DELETE FROM carrito WHERE id_usuario = $1`, [userId]);
        res.json({ success: true, message: "Carrito vaciado" });
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, error: "Error vaciando carrito" });
    }
});
// ============================================
// RUTA RAÍZ
// ============================================
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});
// ============================================
// MANEJO DE ERRORES 404
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Ruta no encontrada"
    });
});
// ============================================
// ARRANQUE DEL SERVIDOR
// ============================================
app.listen(PORT, () => {
    ensureProfileFeatureTables();
    console.log(`🚩 Servidor VEXILO escuchando en http://localhost:${PORT}`);
    console.log(`📁 Frontend servido desde: ${frontendPath}`);
});
