# AuctionHub

AuctionHub es la base de una aplicación de subastas. El repositorio contiene un frontend React con Vite, una API Express en TypeScript y un entorno de desarrollo Docker Compose con PostgreSQL, MinIO y herramientas de observabilidad.

> **Estado actual:** la infraestructura de desarrollo y la base del backend están preparadas. La API ofrece `/health` y `/api`; el contrato Prisma define usuarios y productos con relaciones entre vendedor y ganador. Todavía faltan la lógica de negocio de autenticación/subastas y las pantallas funcionales.

## Captura de los contenedores

La siguiente captura muestra el estado de Docker Desktop durante la configuración: PostgreSQL, MinIO, cAdvisor, Prometheus, Grafana, frontend y backend están activos. `minio-init` aparece detenido porque es una tarea de inicialización que termina correctamente después de crear el bucket.

![Contenedores de AuctionHub en Docker Desktop](docs/images/containers-running.png)

## Tecnologías

- **Frontend:** React, TypeScript y Vite; están instalados Axios, TanStack Query, Zustand, React Router, Lucide React y Tailwind CSS.
- **Backend:** Node.js, Express y TypeScript ejecutado en desarrollo con `tsx`; Zod, Prisma ORM 8 RC, el cliente S3 de AWS y dependencias de autenticación.
- **Datos y archivos:** PostgreSQL 17 y MinIO compatible con S3.
- **Observabilidad:** Prometheus recoge métricas de Prometheus y cAdvisor; Grafana proporciona la interfaz de visualización.
- **Contenedores:** Docker Compose y Dockerfiles de desarrollo independientes para backend y frontend.

## Requisitos

- Docker Desktop con Docker Compose.
- Node.js y pnpm 10.33.0 para ejecutar frontend o backend fuera de Docker.

## Configuración

1. Clona el repositorio y entra en su directorio raíz.
2. Crea el archivo local de variables de entorno a partir de la plantilla:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Revisa `.env` y cambia las contraseñas de ejemplo antes de utilizar el proyecto fuera de un entorno local. **No publiques `.env` ni incluyas credenciales reales en el repositorio.**

Docker Compose lee el `.env` situado en la raíz para configurar los servicios. Para ejecutar el backend directamente en el host, se puede usar `backend/.env`; ese archivo también debe contener valores locales válidos y no debe publicarse.

## Iniciar el entorno completo

Desde la raíz del proyecto:

```powershell
docker compose up -d --build
```

Este comando inicia los contenedores, pero **no deja activo el observador de archivos**. Para desarrollo con sincronización automática, inicia el entorno en primer plano con:

```powershell
docker compose up --watch
```

Mantén esa terminal abierta mientras desarrollas. Si los contenedores ya están levantados, detén primero el proceso anterior de Compose Watch y luego inicia el observador; no ejecutes dos observadores simultáneos para el mismo proyecto.

Comprueba el estado:

```powershell
docker compose ps
```

Consulta los registros si un servicio no inicia:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
```

Para detener los servicios sin borrar los datos persistidos:

```powershell
docker compose down
```

Los datos de PostgreSQL, MinIO, Prometheus y Grafana se guardan en volúmenes de Docker. No uses `docker compose down -v` salvo que quieras eliminar esos datos.

## Servicios y puertos

Los puertos externos los define el `.env` de la raíz; los valores de la plantilla son:

| Servicio | URL o puerto local | Uso |
|---|---|---|
| Frontend | <http://localhost:5173> | Aplicación React/Vite |
| Backend | <http://localhost:3000> | API Express |
| Backend health | <http://localhost:3000/health> | Comprueba que la API responde |
| PostgreSQL | `localhost:5433` | Base de datos; dentro de Compose escucha en `postgres:5432` |
| MinIO API | <http://localhost:9000> | API compatible con S3 |
| MinIO Console | <http://localhost:9001> | Consola de administración de MinIO |
| cAdvisor | <http://localhost:8081> | Métricas de contenedores |
| Prometheus | <http://localhost:9090> | Consultas y objetivos de métricas |
| Grafana | <http://localhost:3001> | Paneles de observabilidad |

El endpoint `GET /health` devuelve HTTP `200` y `{"status":"ok"}`. Grafana usa el usuario `admin`; la contraseña se define mediante `GRAFANA_ADMIN_PASSWORD` en `.env`.

La API también expone `GET /api`, que confirma que el enrutador central está montado.

## Cómo se inicializan los servicios

1. PostgreSQL inicia y Compose espera a que su comprobación de salud sea satisfactoria.
2. MinIO inicia con las credenciales locales configuradas.
3. `minio-init` espera a MinIO, crea el bucket configurado si aún no existe y establece una política de lectura pública para los objetos. Es una tarea de una sola ejecución: **`Exited (0)` significa que terminó correctamente**, no que MinIO haya fallado.
4. El backend espera a PostgreSQL y a que `minio-init` termine. `server.ts` carga el entorno, inicia Express en `0.0.0.0` usando `PORT` y registra `/health`.
5. El frontend inicia Vite escuchando en `0.0.0.0` dentro del contenedor, de modo que el puerto publicado sea accesible desde el host.
6. Prometheus consulta sus propios endpoints y cAdvisor cada 15 segundos; Grafana queda disponible en el puerto publicado.

En la red interna de Compose, los servicios se comunican usando sus nombres de servicio (por ejemplo, `postgres:5432` y `minio:9000`), no los puertos publicados del host.

## Prisma ORM 8

Este proyecto usa Prisma ORM 8 Release Candidate, siguiendo la guía oficial [Set up Prisma ORM from scratch](https://www.prisma.io/docs/prisma-orm/from-scratch). En esta versión el esquema es un contrato en `backend/prisma/contract.prisma`; la conexión se configura en `backend/prisma.config.ts` y el runtime se importa desde `@prisma/orm-postgres`. Por tanto, este backend no usa `@prisma/client`, `schema.prisma`, `prisma generate` ni `migrate dev`.

El contrato inicial contiene:

- `User`: identificador UUID, nombre de usuario y correo únicos, contraseña y rol (`buyer` por defecto).
- `Product`: título, descripción, precios, imagen y estado (`available` por defecto).
- Relaciones de producto con el vendedor y, opcionalmente, con el usuario ganador.

Al iniciar (`pnpm dev` o `pnpm start`), el script ejecuta `prisma contract emit` para generar `contract.json` y `contract.d.ts` antes de arrancar la API. Cambia el contrato y ejecuta estos comandos desde `backend` para gestionar la base de datos:

```powershell
pnpm prisma:init
pnpm prisma:migration:plan --name <nombre_del_cambio>
pnpm prisma:migrate
pnpm prisma:migration:status
```

`prisma:init` inicializa y firma el estado inicial del contrato en PostgreSQL. Para cambios posteriores, emite el contrato, crea el plan de migración y aplícalo. Estos comandos modifican el esquema y los datos de la base; ejecútalos solo contra la base de desarrollo correcta. La guía oficial explica el flujo y los requisitos de una base vacía para la inicialización.

La conexión a PostgreSQL se obtiene de `DATABASE_URL`. En local la proporciona `backend/.env`; dentro de Compose, el servicio backend recibe la conexión del `.env` de la raíz y se conecta a `postgres:5432`.

## Base de la API

- `backend/server.ts` configura Express, CORS, JSON, rutas bajo `/api`, manejo centralizado de errores y apagado del servidor.
- `backend/src/database/prisma.ts` crea una instancia compartida del runtime de Prisma ORM 8.
- `backend/src/services/minio.service.ts` sube archivos al bucket configurado y devuelve su URL pública.
- `backend/src/middlewares/auth.middleware.ts` valida tokens JWT y permite restringir rutas por rol (`seller`, `buyer` o `admin`).
- `backend/src/middlewares/error.middleware.ts` normaliza errores HTTP y de validación Zod.
- Los modelos de `backend/src/models/` realizan las operaciones CRUD de usuarios y productos con el runtime Prisma ORM 8.
- Los controladores de `backend/src/controllers/` validan y normalizan las entradas, aplican reglas de acceso/negocio y forman las respuestas HTTP.
- Las rutas de `backend/src/routes/` exponen autenticación, usuarios y productos bajo `/api`.

El registro e inicio de sesión, la gestión básica de usuarios y el CRUD de productos están implementados. Los flujos de pujas, cierre de subastas y compra todavía deben desarrollarse.

## Desarrollo local sin Docker

Cada aplicación tiene su propio `package.json` y lockfile. Instala sus dependencias y ejecuta los scripts desde su carpeta:

```powershell
Set-Location backend
pnpm install
pnpm dev
```

En otra terminal:

```powershell
Set-Location frontend
pnpm install
pnpm dev
```

El backend carga `backend/.env` y utiliza el `PORT` definido allí. Para desarrollo local, configura la URL de PostgreSQL y MinIO con direcciones accesibles desde el host. Vite muestra la URL local al arrancar.

Con `docker compose up --watch` activo, las reglas `develop.watch` sincronizan cambios de archivos fuente de backend y frontend; los cambios en dependencias, configuración de Prisma o Dockerfiles reconstruyen el servicio. `docker compose up -d` por sí solo no activa la sincronización.

## Configuración de observabilidad

Prometheus carga [observability/prometheus/prometheus.yml](observability/prometheus/prometheus.yml). El archivo define objetivos para `prometheus:9090` y `cadvisor:8080`. El estado de esos objetivos puede revisarse en <http://localhost:9090/targets>.

La configuración debe ser un archivo YAML. Si `prometheus.yml` aparece como carpeta en Windows, el montaje de Compose falla porque intenta montar un directorio como archivo.

## Estructura principal

```text
.
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── Dockerfile.dev
│   ├── prisma.config.ts
│   ├── prisma/
│   │   └── contract.prisma
│   ├── server.ts
│   ├── package.json
│   └── src/
│       ├── database/
│       ├── middlewares/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── Dockerfile.dev
│   ├── package.json
│   └── src/
├── observability/
│   └── prometheus/
│       └── prometheus.yml
└── docs/
    └── images/
        └── containers-running.png
```

## Trabajo pendiente

- Ejecutar la inicialización del contrato Prisma en la base de desarrollo y guardar los archivos de migración.
- Implementar controladores y rutas de registro/inicio de sesión, productos, pujas y subastas.
- Implementar rutas, controladores, validación y persistencia de usuarios, productos y subastas.
- Conectar las operaciones de archivos de la API con MinIO.
- Implementar las páginas y flujos funcionales del frontend e integrarlos con la API.
- Añadir paneles de Grafana y pruebas de la aplicación.
