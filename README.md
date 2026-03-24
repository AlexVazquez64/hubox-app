# Hubox Contact Form

Aplicación full-stack para captura y gestión de contactos con autenticación OAuth 2.0, JWT y exportación a Excel.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 · Tailwind CSS · Vite |
| Backend | Node.js · Express · Sequelize |
| Base de Datos | MySQL 8.0 |
| Auth | Google OAuth 2.0 · JWT |
| Seguridad | Google reCAPTCHA v3 · Helmet · Rate Limiting |
| Infra | Docker · Docker Compose |

---

## Inicio rápido

### 1. Prerequisitos

- Docker Desktop ≥ 4.x
- Node.js 20+ (solo para desarrollo local sin Docker)

### 2. Clonar y configurar variables de entorno

```bash
git clone <repo-url> hubox-app
cd hubox-app
cp .env.example .env
```

Edita `.env` con tus credenciales reales, especialmente:
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` (obtenidos en [Google Cloud Console](https://console.cloud.google.com/apis/credentials))
- `JWT_SECRET` (mínimo 64 caracteres aleatorios)

### 3. Levantar el entorno completo

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend (React) | http://localhost:3000 |
| API (Express) | http://localhost:4000/api |
| MySQL | localhost:3306 |

### 4. Desarrollo local sin Docker

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

---

## Arquitectura del Backend

```
backend/src/
├── config/
│   └── database.js          # Configuración Sequelize
├── controllers/
│   ├── auth.controller.js   # Google OAuth + JWT
│   └── contact.controller.js
├── middleware/
│   ├── auth.js              # authenticate · requireAdmin
│   ├── errorHandler.js      # AppError · globalErrorHandler
│   ├── rateLimiter.js       # apiLimiter · contactFormLimiter
│   └── validators.js        # express-validator rules
├── models/
│   ├── Contact.js
│   └── User.js
├── routes/
│   ├── auth.routes.js
│   └── contact.routes.js
├── services/
│   ├── auth.service.js      # verifyGoogleToken · issueAccessToken
│   └── contact.service.js   # create · findAll · exportToExcel
├── app.js
└── server.js
```

## Endpoints de la API

### Auth

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/google` | Público | Recibe `idToken` de Google, retorna JWT |
| `GET` | `/api/auth/me` | JWT | Perfil del usuario autenticado |

### Contactos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/contacts` | Público | Enviar formulario (rate-limited: 5/hora) |
| `GET` | `/api/contacts` | JWT | Listar con filtros y paginación |
| `GET` | `/api/contacts/export` | Admin | Descargar Excel (.xlsx) |
| `PATCH` | `/api/contacts/:id/status` | Admin | Actualizar estado del contacto |

### Query params para `GET /api/contacts`

```
?page=1&limit=20&status=new&search=garcia
```

---

## Funcionalidades destacadas

### Validación de integridad de datos
El servicio `contact.service.js` verifica que no existan envíos duplicados del mismo email dentro de una ventana de 24 horas, respondiendo con un `409 Conflict` antes de persistir.

### Exportar a Excel
El endpoint `GET /api/contacts/export` (rol admin) genera un `.xlsx` en tiempo real usando `ExcelJS` sin crear archivos temporales en disco — el workbook se escribe directamente al stream HTTP.

### Rate Limiting por capas
- Límite global: 100 requests / 15 min por IP para toda la API
- Límite específico de formulario: 5 envíos / hora por IP

### Roles de usuario
- `viewer` — puede consultar la lista de contactos
- `admin` — puede cambiar estados y exportar

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `API_PORT` | Puerto del backend | `4000` |
| `CLIENT_URL` | URL del frontend (CORS) | `http://localhost:3000` |
| `DB_NAME` | Nombre de la base de datos | `hubox_contacts` |
| `DB_USER` | Usuario de MySQL | `hubox_user` |
| `DB_PASSWORD` | Contraseña de MySQL | — |
| `JWT_SECRET` | Secreto para firmar tokens | mín. 64 chars |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth | — |
| `VITE_API_URL` | URL de la API para el frontend | `http://localhost:4000/api` |

---

---

## 🛡️ Seguridad y Calidad de Datos

Se implementó un esquema de seguridad por capas para proteger la infraestructura y la integridad de la base de datos:

1. **Google reCAPTCHA v3:** Implementación de análisis de comportamiento invisible. A diferencia de versiones anteriores, no interrumpe la experiencia del usuario, pero permite puntuar la legitimidad de cada envío de formulario. Esto **bloquea scripts automatizados y spam** antes de que realicen un `INSERT` en la base de datos, optimizando el almacenamiento.
2. **Validación de Dominios:** El sistema integra un filtro de **dominios de correo desechables**, obligando a que los leads capturados sean de cuentas de correo legítimas y permanentes.
3. **Protección de Sesión:** Autenticación vía **OAuth 2.0 y JWT** con manejo de persistencia segura y protección de rutas administrativas.
4. **Rate Limiting:** Control de flujo de peticiones para mitigar ataques de denegación de servicio (DoS) o fuerza bruta en el login.

---

## Escalabilidad — decisiones de arquitectura

1. **UUID como PK** — evita colisiones al migrar a microservicios o múltiples instancias.
2. **Sequelize ORM** — los modelos son independientes del motor; migrar de MySQL a PostgreSQL requiere cambiar solo el dialecto.
3. **Service layer** — la lógica de negocio vive en `services/`, no en controllers, facilitando testing unitario.
4. **Variables de entorno** — cero configuración hardcodeada; apto para cualquier plataforma cloud (Railway, Fly.io, AWS ECS).
5. **Audit log table** — trazabilidad completa de acciones admin sin modificar tablas de negocio.
6. **Stream de Excel** — el export escribe directamente al response stream, soporta datasets grandes sin memoria extra.
