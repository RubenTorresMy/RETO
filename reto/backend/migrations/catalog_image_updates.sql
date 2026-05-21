-- Eliminar productos duplicados antes de insertar
-- Eliminar productos duplicados (por nombre o imagen)
DELETE FROM producto WHERE id_producto IN (11,12,13,14,15,16,17,18,19);
DELETE FROM producto WHERE nombre IN ('Spain Flag','Event Canvas Banner','Andalusia Flag','Large Company Canvas','EU Flag','Trade Fair Canvas','Valencia Flag','Interior Canvas','Catalonia Flag','Outdoor Canvas','France Flag','Germany Flag','Italy Flag','Portugal Flag','United Kingdom Flag','United States Flag','Canada Flag','Mexico Flag','Argentina Flag');

ALTER TABLE producto ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);
ALTER TABLE producto ADD COLUMN IF NOT EXISTS categoria VARCHAR(32);

INSERT INTO usuario (id_usuario, nombre_usuario, fecha_registro, email, rol)
SELECT COALESCE(MAX(id_usuario), 0) + 1, 'Victor Bonilla', CURRENT_DATE, 'victor.bonilla@mail.com', 'worker'
FROM usuario
WHERE NOT EXISTS (
  SELECT 1 FROM usuario WHERE LOWER(nombre_usuario) = LOWER('Victor Bonilla')
);

UPDATE usuario
SET rol = 'worker'
WHERE LOWER(nombre_usuario) = LOWER('Victor Bonilla');



-- English names, categories, prices, and visible images (reinsert)
INSERT INTO producto (id_producto, nombre, descripcion, precio, imagen, categoria) VALUES
  (1, 'Spain Flag', 'Spanish national flag', 15.00, 'https://flagcdn.com/w320/es.png', 'flag'),
  (2, 'Event Canvas Banner', 'Customizable event canvas banner', 25.00, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', 'canvas'),
  (3, 'Andalusia Flag', 'Andalusian regional flag', 15.00, 'https://flagcdn.com/w320/an.png', 'flag'),
  (4, 'Large Company Canvas', 'Large format company canvas', 30.00, 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80', 'canvas'),
  (5, 'EU Flag', 'European Union flag', 15.00, 'https://flagcdn.com/w320/eu.png', 'flag'),
  (6, 'Trade Fair Canvas', 'Trade fair promotional canvas', 22.00, 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80', 'canvas'),
  (7, 'Valencia Flag', 'Valencian regional flag', 15.00, 'https://flagcdn.com/w320/va.png', 'flag'),
  (8, 'Interior Canvas', 'Interior decorative canvas', 20.00, 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', 'canvas'),
  (9, 'Catalonia Flag', 'Catalonian regional flag', 15.00, 'https://flagcdn.com/w320/ct.png', 'flag'),
  (10, 'Outdoor Canvas', 'Outdoor resistant canvas', 24.00, 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80', 'canvas');



-- New country flag products (English, PNG/JPG, category, checked images)
INSERT INTO producto (id_producto, nombre, descripcion, precio, imagen, categoria) VALUES
  (11, 'France Flag', 'French national flag', 15.00, 'https://flagcdn.com/w320/fr.png', 'flag'),
  (12, 'Germany Flag', 'German national flag', 15.00, 'https://flagcdn.com/w320/de.png', 'flag'),
  (13, 'Italy Flag', 'Italian national flag', 15.00, 'https://flagcdn.com/w320/it.png', 'flag'),
  (14, 'Portugal Flag', 'Portuguese national flag', 15.00, 'https://flagcdn.com/w320/pt.png', 'flag'),
  (15, 'United Kingdom Flag', 'UK national flag', 15.00, 'https://flagcdn.com/w320/gb.png', 'flag'),
  (16, 'United States Flag', 'USA national flag', 15.00, 'https://flagcdn.com/w320/us.png', 'flag'),
  (17, 'Canada Flag', 'Canadian national flag', 15.00, 'https://flagcdn.com/w320/ca.png', 'flag'),
  (18, 'Mexico Flag', 'Mexican national flag', 15.00, 'https://flagcdn.com/w320/mx.png', 'flag'),
  (19, 'Argentina Flag', 'Argentinian national flag', 15.00, 'https://flagcdn.com/w320/ar.png', 'flag');



-- Flag patterns for designs (generated, color-matching, PNG/JPG)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/es.png' WHERE id_diseno = 1; -- Spain (red/yellow)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/fr.png' WHERE id_diseno = 2; -- France (blue/white/red)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/de.png' WHERE id_diseno = 3; -- Germany (black/red/yellow)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/it.png' WHERE id_diseno = 4; -- Italy (green/white/red)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/pt.png' WHERE id_diseno = 5; -- Portugal (green/red)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/gb.png' WHERE id_diseno = 6; -- UK (red/white/blue)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/us.png' WHERE id_diseno = 7; -- USA (red/white/blue)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/ca.png' WHERE id_diseno = 8; -- Canada (red/white)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/mx.png' WHERE id_diseno = 9; -- Mexico (green/white/red)
UPDATE diseno SET imagen = 'https://flagcdn.com/w320/ar.png' WHERE id_diseno = 10; -- Argentina (light blue/white)
