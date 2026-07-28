# Backend

API REST Laravel para la app movil Android de noticias.

## Stack

- Laravel 13
- PHP 8.3+
- PostgreSQL
- JWT con `php-open-source-saver/jwt-auth`

## Instalacion

Ruta rapida en Windows desde la raiz del repositorio:

```powershell
.\scripts\setup-backend.ps1
```

Ruta manual:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
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
```

## Base de datos

La base de datos esperada es PostgreSQL:

```text
database: news_agentic
username: postgres
password: postgres
port: 5432
```

Puedes levantarla con Docker desde la raiz:

```bash
docker compose up -d postgres
```

Las tablas se crean con migraciones Laravel:

```bash
php artisan migrate:fresh --seed
```

El seeder crea:

- Usuario demo: `demo@example.com / password`
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
