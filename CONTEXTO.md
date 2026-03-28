# CONTEXTO DEL PROYECTO — Sistema de Tickets

## Descripción general
Sistema de tickets de soporte técnico desarrollado para ser vendido como producto.
Permite a clientes crear tickets, agentes atenderlos y admins gestionar todo el sistema.

---

## Stack tecnológico

### Frontend (este proyecto)
- React + Vite
- Tailwind CSS
- React Router v6
- TanStack Query (React Query) v5
- Zustand (estado global — sesión del usuario)
- Axios (llamadas a la API)

### Backend (ya construido — Node.js + Express)
- Corre en hosting cPanel Chile con "Setup Node.js App"
- Puerto local de desarrollo: http://localhost:3000
- Prefijo de todas las rutas: /api

### Base de datos (MySQL — ya construida)
- dim_rol
- dim_departamento
- dim_categoria (cada categoría pertenece a un departamento)
- dim_estado
- dim_prioridad
- dim_usuario (id_departamento nullable — solo agentes tienen depto)
- fact_ticket
- fact_comentario

---

## Roles del sistema

| Rol     | Permisos |
|---------|----------|
| admin   | Ve todos los tickets, gestiona usuarios, reasigna agentes, accede a reportes |
| agente  | Ve tickets de su departamento, cambia estado y prioridad, agrega comentarios internos |
| cliente | Crea tickets, ve solo los suyos, agrega comentarios públicos |

---

## Endpoints de la API

### Autenticación
| Método | Ruta | Body / Params | Respuesta |
|--------|------|---------------|-----------|
| POST | /api/auth/login | { email, password } | { ok, token, user } |
| GET  | /api/auth/me | — (header Authorization) | { ok, user } |

### Tickets
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET    | /api/tickets | Todos | Lista paginada. Query params: estado, prioridad, pagina, limite |
| GET    | /api/tickets/:id | Todos | Ticket + comentarios |
| POST   | /api/tickets | Todos | Crear ticket |
| PATCH  | /api/tickets/:id | Admin, Agente | Actualizar estado / prioridad / reasignar |
| POST   | /api/tickets/:id/comentarios | Todos | Agregar comentario |

#### Body POST /api/tickets
```json
{
  "id_departamento": 1,
  "id_categoria": 2,
  "id_prioridad": 2,
  "titulo": "string",
  "descripcion": "string"
}
```

#### Body PATCH /api/tickets/:id
```json
{
  "id_estado": 2,
  "id_prioridad": 3,
  "id_usuario_asignado": 5
}
```

#### Body POST /api/tickets/:id/comentarios
```json
{
  "contenido": "string",
  "es_interno": false
}
```

### Usuarios (solo admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | /api/usuarios | Listar todos |
| POST   | /api/usuarios | Crear usuario |
| PATCH  | /api/usuarios/:id | Actualizar usuario |
| GET    | /api/usuarios/agentes?id_departamento=X | Agentes por depto (para reasignar) |

#### Body POST /api/usuarios
```json
{
  "nombre": "string",
  "apellido": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "id_rol": 2,
  "id_departamento": 1
}
```

### Catálogos (todos los roles autenticados)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/catalogos/departamentos | Lista departamentos activos |
| GET | /api/catalogos/categorias?id_departamento=X | Categorías del departamento |
| GET | /api/catalogos/estados | Lista estados con color_hex y orden |
| GET | /api/catalogos/prioridades | Lista prioridades con color_hex y nivel |

---

## Respuestas de la API

### Formato estándar
```json
{ "ok": true, "data": ... }
{ "ok": false, "message": "descripción del error" }
```

### Objeto ticket completo (GET /api/tickets/:id)
```json
{
  "id_ticket": 1,
  "titulo": "string",
  "descripcion": "string",
  "estado": "Abierto",
  "estado_color": "#3B82F6",
  "prioridad": "Alta",
  "prioridad_color": "#F59E0B",
  "departamento": "Soporte Técnico",
  "categoria": "Falla de sistema",
  "creador": "Juan Pérez",
  "asignado": "María González",
  "created_at": "2025-01-01T12:00:00",
  "updated_at": "2025-01-01T13:00:00",
  "closed_at": null
}
```

### Objeto usuario en JWT (store)
```json
{
  "id_usuario": 1,
  "email": "string",
  "nombre": "string",
  "apellido": "string",
  "rol": "admin | agente | cliente",
  "id_departamento": 1
}
```

---

## Autenticación en el frontend

- El token JWT se guarda en localStorage con la clave `ticket_token`
- Se envía en cada request como header: `Authorization: Bearer <token>`
- Si la API responde 401, redirigir al login y limpiar el store
- El store de Zustand guarda: `{ user, token, setAuth, logout }`

---

## Estructura de carpetas del frontend

```
src/
├── api/
│   ├── axios.js            ← instancia axios con baseURL e interceptores
│   ├── auth.api.js
│   ├── ticket.api.js
│   ├── usuario.api.js
│   └── catalogo.api.js
├── store/
│   └── auth.store.js       ← Zustand: user + token
├── hooks/
│   ├── useTickets.js
│   ├── useTicket.js
│   └── useCatalogos.js
├── components/
│   ├── ui/                 ← Badge, Spinner, Modal, ConfirmDialog
│   ├── layout/             ← Sidebar, Navbar, Layout
│   └── tickets/            ← TicketCard, TicketForm, ComentarioList
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Tickets.jsx
│   ├── TicketDetalle.jsx
│   ├── NuevoTicket.jsx
│   └── admin/
│       ├── Usuarios.jsx
│       └── Reportes.jsx
└── router/
    └── index.jsx           ← rutas protegidas por rol
```

---

## Estados del ticket y colores

| Estado | Color hex |
|--------|-----------|
| Abierto | #3B82F6 |
| En progreso | #F59E0B |
| En espera | #8B5CF6 |
| Resuelto | #10B981 |
| Cerrado | #6B7280 |

---

## Prioridades y colores

| Prioridad | Nivel | Color hex |
|-----------|-------|-----------|
| Baja | 1 | #6B7280 |
| Media | 2 | #3B82F6 |
| Alta | 3 | #F59E0B |
| Crítica | 4 | #EF4444 |

---

## Lógica de negocio importante

### Creación de ticket
1. Usuario elige departamento
2. Se cargan las categorías de ese departamento desde /api/catalogos/categorias?id_departamento=X
3. Usuario elige categoría + prioridad + título + descripción
4. Al guardar, la API asigna automáticamente el agente con menos tickets activos del depto
5. El ticket nace en estado "Abierto"

### Asignación de agentes
- Automática al crear (round-robin por carga mínima)
- Manual por admin: PATCH /api/tickets/:id con { id_usuario_asignado }
- Para reasignar cargar agentes con GET /api/usuarios/agentes?id_departamento=X

### Comentarios
- es_interno: true → nota privada, solo visible para admin y agentes
- es_interno: false → respuesta pública, visible para todos
- Los clientes siempre envían es_interno: false (la API lo fuerza)
- Los comentarios internos deben mostrarse visualmente distintos (fondo amarillo o borde izquierdo destacado)

### Visibilidad de tickets
- cliente → solo ve sus propios tickets
- agente → ve todos los tickets de su departamento
- admin → ve todos los tickets sin restricción

### Sidebar por rol
- admin: Dashboard, Tickets, Usuarios, Reportes
- agente: Dashboard, Tickets
- cliente: Mis Tickets, Nuevo Ticket

---

## Variables de entorno (.env)

```
VITE_API_URL=http://localhost:3000/api
```

En producción cambiar a la URL del hosting.

---

## Credenciales de prueba

- Email: admin@123.cl
- Password: 12345
- Rol: admin
