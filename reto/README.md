# VEXILO - Tienda de Banderas Personalizadas

Plataforma web para diseñar y personalizar banderas. Este proyecto consiste en un **backend** (Express + TypeScript) y un **frontend** (HTML, CSS, JavaScript vanilla).

## 📋 Estructura del Proyecto

```
reto/
├── backend/
│   ├── server.ts           # Servidor Express
│   ├── package.json
│   ├── tsconfig.json
│   └── node_modules/
│
└── frontend/
    ├── public/
    │   ├── index.html      # Página principal
    │   ├── styles.css      # Estilos CSS
    │   └── main.js         # Lógica JavaScript
    ├── package.json
    └── tsconfig.json
```

## 🚀 Instalación y Uso

### 1. Instalar dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Ejecutar el proyecto

**Opción A: En terminales separadas**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Acceder al frontend:
- Abre el navegador en: `http://localhost:3000`

**Opción B: Usar ambas en paralelo con npm**
```bash
npm run dev  # (si tienes scripts configurados)
```

## 📦 Tecnologías

- **Backend**: Express, TypeScript, Node.js
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Comunicación**: REST API (CORS habilitado)
- **Base de datos**: Próximamente (MongoDB/PostgreSQL)

## 🎯 Funcionalidades Actuales (MVP)

✅ **Página principal responsiva**
- Header con navegación
- Hero section
- Grid de productos (Best Sold)
- Grid de productos (User Favorites)
- Sección de estilos
- Carrusel de testimonios
- Newsletter subscription
- Footer

✅ **Menús funcionales**
- Navegación interactiva
- Botones con eventos
- Búsqueda preparada
- Carrito preparado
- Perfil de usuario preparado

✅ **Productos de muestra**
- Datos simulados en el frontend
- Datos simulados en el backend
- Estructura preparada para integración con BD

✅ **API Endpoints básicos**
- `GET /api/products` - Obtener productos
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/newsletter/subscribe` - Suscribirse a newsletter
- `GET /api/testimonials` - Obtener testimonios
- `POST /api/auth/login` - Login (simulado)
- `POST /api/auth/register` - Registro (simulado)
- `GET /api/designs` - Obtener diseños
- `POST /api/designs` - Crear diseño

## 📝 Notas Importantes

### Para Futuro: Integración de Base de Datos

La estructura actual está preparada para integración con BD. Para conectar una base de datos:

1. **Backend**: Reemplaza los arrays `mockProducts` y `mockTestimonials` por queries a la BD
2. **Frontend**: Los datos ya se obtienen a través de la API (ver `api` object en `main.js`)
3. **Autenticación**: Implementar JWT con MongoDB/PostgreSQL

### Estructura de datos esperada (Base de Datos)

**Productos:**
```javascript
{
  id: Number,
  name: String,
  description: String,
  price: Number,
  rating: Number,
  reviews: Number,
  category: String,
  imageUrl: String,
  stock: Number
}
```

**Usuarios:**
```javascript
{
  id: Number,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

**Diseños:**
```javascript
{
  id: Number,
  userId: Number,
  name: String,
  data: Object,
  preview: String,
  createdAt: Date,
  isPublic: Boolean
}
```

## 🎨 Personalización

### Cambiar colores
Edita las variables CSS en `frontend/public/styles.css`:
```css
:root {
    --primary-color: #000;      /* Negro principal */
    --secondary-color: #fff;    /* Blanco */
    --accent-color: #f0f0f0;    /* Gris claro */
}
```

### Agregar/Modificar productos
Edita los arrays en `frontend/public/main.js`:
- `bestSoldProducts`
- `userFavoritesProducts`
- `mockProducts` (backend)

### Cambiar número de puertos
En `backend/server.ts`:
```typescript
const PORT = 3000; // Cambiar aquí
```

## 📱 Responsive Design

El sitio es completamente responsive:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

## 🔄 Flujo de desarrollo recomendado

1. **Fase 1** (Actual): Diseño y funcionalidad básica ✅
2. **Fase 2**: Implementar base de datos
3. **Fase 3**: Panel de administración
4. **Fase 4**: Editor de personalización
5. **Fase 5**: Sistema de pagos
6. **Fase 6**: Deployment

## 📞 Contacto y Soporte

Para preguntas o sugerencias, contacta al desarrollador.

---

**Estado**: En desarrollo 🚧
**Última actualización**: Abril 2025
