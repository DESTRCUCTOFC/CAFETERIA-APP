# CAFETERIA-APP

Descripción
------------------
CAFETERIA-APP es una aplicación de ejemplo para gestionar un servicio de cafetería: autenticación de usuarios, gestión de menú, creación y seguimiento de pedidos, y procesamiento de pagos. El repositorio contiene un backend en Node.js/Express y una interfaz frontend estática con páginas HTML y scripts JavaScript.

Estructura principal
--------------------
•⁠  ⁠⁠ backend/ ⁠ : API y lógica del servidor.
	- ⁠ src/index.js ⁠ : punto de entrada del servidor.
	- ⁠ src/config/ ⁠ : configuración y utilidades (por ejemplo ⁠ cloudinary.js ⁠, ⁠ env.js ⁠, ⁠ firebase.js ⁠).
	- ⁠ src/modules/ ⁠ : módulos:
		- ⁠ auth/ ⁠ : controladores y rutas de autenticación (⁠ auth.controller.js ⁠, ⁠ auth.routes.js ⁠).
		- ⁠ menu/ ⁠ : gestión del menú, middleware y rutas (⁠ menu.controller.js ⁠, ⁠ menu.middleware.js ⁠, ⁠ menu.routes.js ⁠).
		- ⁠ orders/ ⁠ : creación y consulta de pedidos (⁠ orders.controller.js ⁠, ⁠ orders.routes.js ⁠).
		- ⁠ payments/ ⁠ : integración con pasarelas de pago (⁠ payments.controller.js ⁠, ⁠ payments.routes.js ⁠).

•⁠  ⁠⁠ frontend/ ⁠ : páginas estáticas y recursos (HTML, CSS, JS, assets).
	- Páginas principales: ⁠ login.html ⁠, ⁠ register.html ⁠, ⁠ dashboard-estudiante.html ⁠, ⁠ dashboard-staff.html ⁠.
	- ⁠ js/ ⁠ : lógica cliente (⁠ cart.js ⁠, ⁠ login.js ⁠, ⁠ register.js ⁠, ⁠ dashboard-*.js ⁠, ⁠ utilities.js ⁠).
	- ⁠ CSS/ ⁠ : estilos (⁠ styles.css ⁠).




Detalles
------------------

Características principales
•⁠  ⁠Registro y autenticación de usuarios (clientes y staff).
•⁠  ⁠Gestión de menú: CRUD de productos/platillos.
•⁠  ⁠Carrito y creación de pedidos.
•⁠  ⁠Integración con pasarelas de pago (ej. Stripe) para procesar pagos.
•⁠  ⁠Soporte para subida de imágenes (Cloudinary + Multer).

Tecnologías
•⁠  ⁠Node.js + Express
•⁠  ⁠Cloudinary para almacenamiento de imágenes
•⁠  ⁠Stripe (u otra pasarela) para pagos
•⁠  ⁠Firebase (opcional, según configuración)

Estructura de carpetas (resumen)
•⁠  ⁠⁠ src/index.js ⁠ — servidor y punto de entrada.
•⁠  ⁠⁠ src/config/ ⁠ — archivos de configuración: ⁠ cloudinary.js ⁠, ⁠ env.js ⁠, ⁠ firebase.js ⁠.
•⁠  ⁠⁠ src/modules/auth/ ⁠ — ⁠ auth.controller.js ⁠, ⁠ auth.routes.js ⁠.
•⁠  ⁠⁠ src/modules/menu/ ⁠ — ⁠ menu.controller.js ⁠, ⁠ menu.routes.js ⁠, ⁠ menu.middleware.js ⁠.
•⁠  ⁠⁠ src/modules/orders/ ⁠ — ⁠ orders.controller.js ⁠, ⁠ orders.routes.js ⁠.
•⁠  ⁠⁠ src/modules/payments/ ⁠ — ⁠ payments.controller.js ⁠, ⁠ payments.routes.js ⁠.

Rutas API (ejemplos)
•⁠  ⁠⁠ POST /api/auth/register ⁠ — registrar usuario.
•⁠  ⁠⁠ POST /api/auth/login ⁠ — iniciar sesión.
•⁠  ⁠⁠ GET /api/menu ⁠ — listar items del menú.
•⁠  ⁠⁠ POST /api/menu ⁠ — crear item (staff).
•⁠  ⁠⁠ POST /api/orders ⁠ — crear pedido.
•⁠  ⁠⁠ GET /api/orders/:id ⁠ — consultar pedido.
•⁠  ⁠⁠ POST /api/payments ⁠ — crear/confirmar pago.

Archivo de ejemplo ⁠ .env ⁠
-------------------------
Usa un archivo ⁠ .env ⁠ en ⁠ backend/ ⁠ con variables que se ajusten a la configuración que desses:

⁠ env
PORT=3000
CLOUDINARY_CLOUD_NAME=tu_nombre
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
STRIPE_SECRET_KEY=sk_test_...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 ⁠

Ejecución recomendada 
----------------------------------
1.⁠ ⁠Instala dependencias:

⁠ bash
cd backend
npm install
 ⁠

2.⁠ ⁠Copia el ejemplo de ⁠ .env ⁠ y configura las claves.
3.⁠ ⁠Inicia en modo desarrollo:

⁠ bash
npm start
 ⁠