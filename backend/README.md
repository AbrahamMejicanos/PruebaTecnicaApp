# Backend

API REST Laravel para la app movil Android de noticias.

## Stack

- Laravel 13
- PHP 8.3+
- PostgreSQL
- JWT con `php-open-source-saver/jwt-auth`

## Ubicacion en consola

Desde la raiz del repositorio:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp
```

Para comandos Laravel manuales debes entrar a:

```powershell
cd backend
```

## Primera instalacion

Usa esta ruta cuando clones el repositorio por primera vez o cuando no tengas `.env`, dependencias ni base preparada.

## Opcion Docker completa

Desde la raiz del repositorio:

```powershell
copy .env.docker.example .env.docker
```

Edita `.env.docker`:

```env
POSTGRES_DB=news_agentic
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

SUPERUSER_NAME="Tu Nombre"
SUPERUSER_EMAIL="tu-correo@example.com"
SUPERUSER_PASSWORD="tu-password-seguro"
```

Si ya tienes PostgreSQL local usando `5432`, puedes cambiar el puerto publicado por Docker:

```env
POSTGRES_PORT=5433
```

Levanta backend + PostgreSQL:

```powershell
docker compose --env-file .env.docker up --build
```

El contenedor backend:

- Instala dependencias Composer si faltan.
- Genera `APP_KEY` y `JWT_SECRET` si faltan.
- Espera a PostgreSQL.
- Ejecuta migraciones.
- Ejecuta seeders.
- Sirve Laravel en `http://localhost:8000`.

Ruta rapida en Windows desde la raiz del repositorio:

```powershell
.\scripts\setup-backend.ps1
```

El script pedira nombre, email y password del superusuario si no estan definidos en `backend/.env`.

Si no usaras Docker porque ya tienes PostgreSQL instalado/local:

```powershell
.\scripts\setup-backend.ps1 -SkipDocker
```

Ruta manual desde `backend/`:

```bash
composer install
cp .env.example .env
```

Edita `backend/.env` y configura:

```env
SUPERUSER_NAME="Tu Nombre"
SUPERUSER_EMAIL=tu-correo@example.com
SUPERUSER_PASSWORD=tu-password-seguro
```

Luego ejecuta:

```bash
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
```

## Levantar entorno local ya configurado

Usa esta ruta cuando ya ejecutaste la primera instalacion y solo quieres levantar el backend.

Terminal 1, desde la raiz, si usas Docker para PostgreSQL:

```powershell
docker compose up -d postgres
```

Terminal 2, desde `backend/`:

```powershell
php artisan serve
```

API disponible:

```text
http://localhost:8000/api
```

Si cambiaste migraciones o seeders y quieres reconstruir datos demo:

```powershell
php artisan migrate:fresh --seed
```

## Variables principales

```env
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=news_agentic
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=
JWT_TTL=60

SUPERUSER_NAME="Tu Nombre"
SUPERUSER_EMAIL=tu-correo@example.com
SUPERUSER_PASSWORD=tu-password-seguro
```

## Base de datos

La base de datos esperada es PostgreSQL. Con Docker, los valores por defecto son:

```text
database: news_agentic
username: postgres
password: postgres
port: 5432
```

Puedes levantarla con Docker desde la raiz:

```bash
docker compose --env-file .env.docker up postgres
```

Si ya tienes PostgreSQL local, configura `backend/.env` con tus credenciales. Por ejemplo, una URL tipo:

```text
postgresql+psycopg2://usuario:password@localhost:5432/base
```

se traduce en Laravel como:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=base
DB_USERNAME=usuario
DB_PASSWORD=password
```

Para tu base local, el nombre de base seria:

```env
DB_DATABASE=industrias_ciclon_db
DB_USERNAME=postgres
```

Completa `DB_PASSWORD` solo en tu `.env` local, no en archivos versionados.

Las tablas se crean con migraciones Laravel:

```bash
php artisan migrate:fresh --seed
```

El seeder crea:

- Rol `superuser`
- Usuario superusuario usando `SUPERUSER_NAME`, `SUPERUSER_EMAIL` y `SUPERUSER_PASSWORD`
- 3 categorias
- 8 noticias

## Endpoints

Todos los endpoints protegidos usan header:

```http
Authorization: Bearer <token>
```

| Metodo | Endpoint | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/login` | No | Autentica usuario y retorna JWT. |
| POST | `/api/logout` | Si | Invalida token. |
| GET | `/api/me` | Si | Retorna usuario autenticado. |
| GET | `/api/news` | Si | Lista noticias. |
| GET | `/api/news/{id}` | Si | Detalle completo de noticia. |
| GET | `/api/news/{id}/recommended` | Si | Retorna 3 recomendadas. |
| GET | `/api/categories` | Si | Lista categorias. |

## Pruebas

```bash
php artisan test
```

Estado actual esperado:

```text
14 tests passed
```
