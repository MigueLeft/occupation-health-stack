# Occupational Health — Stack Local

Levanta el frontend, backend y base de datos con un solo comando usando Docker Compose.

## Estructura esperada en el Desktop

```
Desktop/
├── occupational-health-stack/     ← esta carpeta
│   ├── docker-compose.yml
│   └── README.md
├── occupational-health/           ← backend (NestJS)
└── occupational-health-front/     ← frontend (React + Vite)
```

> Las tres carpetas deben estar al mismo nivel. Si las renombraste, actualiza
> los `context:` en `docker-compose.yml`.

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Docker Desktop | 4.x | `docker --version` |
| Docker Compose | v2 (incluido en Docker Desktop) | `docker compose version` |

---

## Levantar el stack

Abre una terminal, navega a esta carpeta y ejecuta:

```bash
cd Desktop/occupational-health-stack

docker compose up --build
```

La primera vez descarga imágenes y compila los proyectos (~3-5 min).
Las siguientes veces sin `--build` arranca en segundos.

### Servicios disponibles

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:3000 |
| Base de datos | solo interna (`db:5432`) |

### Credenciales por defecto

**Aplicación (usuario admin):**

| Campo | Valor |
|---|---|
| Email | `admin@salud-ocupacional.com` |
| Contraseña | `Admin@2025!` |
| Recuperacion contraseña | `fcmpecapmil2026` |
| Rol | Admin (todos los permisos) |

**Base de datos (acceso externo):**

| Campo | Valor |
|---|---|
| Host | `localhost:5432` |
| Usuario | `postgres` |
| Contraseña | `1234` |
| DB | `occupational_health` |

> El backend aplica las migraciones automáticamente antes de arrancar.
> No hace falta correrlas manualmente.

---

## Comandos útiles

```bash
# Levantar en segundo plano
docker compose up --build -d

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Detener sin borrar datos
docker compose stop

# Detener y eliminar contenedores (los datos de la DB se conservan en el volumen)
docker compose down

# Detener, eliminar contenedores Y borrar la base de datos
docker compose down -v
```

---

## Reconstruir solo un servicio

Si hiciste cambios en el código y quieres reconstruir una sola imagen:

```bash
# Solo el backend
docker compose up --build backend

# Solo el frontend
docker compose up --build frontend
```

---

## Variables de entorno

Las variables están definidas directamente en `docker-compose.yml`.
Para cambiarlas (p.ej. usar otro `BETTER_AUTH_SECRET` en producción),
crea un archivo `.env` en esta carpeta y referencia las variables con `${VAR}`:

```env
# .env (no subir a git)
BETTER_AUTH_SECRET=tu_secreto_seguro
POSTGRES_PASSWORD=tu_password
```

---

## Solución de problemas

**El backend falla al arrancar:**
Espera a que el healthcheck de la DB pase. Si el error persiste, revisa los logs:
```bash
docker compose logs backend
```

**El puerto 80 está ocupado:**
Cambia el puerto del frontend en `docker-compose.yml`:
```yaml
ports:
  - "8080:80"   # accede en http://localhost:8080
```

**Quiero conectarme a la base de datos desde un cliente externo (DBeaver, TablePlus):**
Expón el puerto de la DB agregando en `docker-compose.yml` bajo el servicio `db`:
```yaml
ports:
  - "5432:5432"
```
Luego conéctate con: host `localhost`, user `postgres`, password `1234`, db `occupational_health`.
