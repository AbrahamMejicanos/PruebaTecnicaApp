# PruebaTecnicaApp

Aplicacion movil Android de noticias con backend Laravel, PostgreSQL, autenticacion JWT y frontend React Native con Expo.

## Estado inicial

Este repositorio esta preparado como monorepo para desarrollar:

- `backend/`: API REST Laravel.
- `mobile/`: app movil React Native / Expo.
- `docs/`: documentacion tecnica y flujo agentico.

La prueba original mencionaba una aplicacion web, pero el criterio vigente es entregar una experiencia principal Android.

## Requisitos locales

- Git
- Node.js y npm
- PHP 8.3 o superior
- Composer
- PostgreSQL 15 o superior, o Docker si se decide levantar servicios por contenedor

## Configuracion creada

- API Laravel funcional instalada en `backend/`.
- Autenticacion JWT configurada con `php-open-source-saver/jwt-auth`.
- Modelos, migraciones y seeders para usuarios, categorias y noticias.
- Endpoints protegidos para noticias, recomendadas y categorias.
- Expo React Native con TypeScript instalado en `mobile/`.
- Dependencias moviles base instaladas: React Navigation, Axios y Expo Secure Store.
- Dependencias de pruebas moviles instaladas: Jest Expo y React Native Testing Library.
- `docker-compose.yml` preparado para PostgreSQL local.

## Comandos utiles

Backend con Docker completo, desde la raiz del repo:

```powershell
copy .env.docker.example .env.docker
```

Edita `.env.docker` y configura `SUPERUSER_EMAIL` / `SUPERUSER_PASSWORD`. Luego:

```powershell
docker compose --env-file .env.docker up --build
```

Esto levanta PostgreSQL, instala dependencias PHP dentro del contenedor, ejecuta migraciones/seeders y publica la API en:

```text
http://localhost:8000/api
```

Backend, primera instalacion desde la raiz del repo:

```powershell
.\scripts\setup-backend.ps1
```

El script te pedira credenciales del superusuario si no existen en `backend/.env`.

Backend, primera instalacion manual desde `backend/`:

```bash
cd backend
composer install
cp .env.example .env
```

Antes de sembrar la base, edita `backend/.env`:

```env
SUPERUSER_NAME="Tu Nombre"
SUPERUSER_EMAIL=tu-correo@example.com
SUPERUSER_PASSWORD=tu-password-seguro
```

Luego continua:

```bash
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
php artisan test
```

Backend, entorno local ya configurado:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp
docker compose up -d postgres
cd backend
php artisan serve
```

Si PostgreSQL ya esta activo localmente, basta con:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp\backend
php artisan serve
```

Para usar una base PostgreSQL local existente, configura `backend/.env` con los datos equivalentes:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=industrias_ciclon_db
DB_USERNAME=postgres
DB_PASSWORD=tu-password-local
```

Setup backend automatizado en Windows:

```powershell
.\scripts\setup-backend.ps1
```

Si ya tienes PostgreSQL levantado y no quieres usar Docker:

```powershell
.\scripts\setup-backend.ps1 -SkipDocker
```

Mobile:

```bash
cd mobile
npm install
npm start
npm test
```

PostgreSQL con Docker:

```bash
docker compose --env-file .env.docker up postgres
```

## Flujo de ramas sugerido

1. Hacer push de esta configuracion base en la rama actual.
2. Crear una rama de desarrollo, por ejemplo `develop`.
3. Implementar por capas: backend funcional, mobile funcional, pruebas y documentacion final.

## Credenciales de acceso

El acceso se crea desde las variables `SUPERUSER_NAME`, `SUPERUSER_EMAIL` y `SUPERUSER_PASSWORD` en `backend/.env`. No hay credenciales de login quemadas en el codigo.

El backend ya cuenta con implementacion funcional. La siguiente fase natural es conectar el frontend movil a estos endpoints.
