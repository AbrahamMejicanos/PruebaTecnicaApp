# Backend

API REST Laravel para la app movil de noticias.

## Stack

- Laravel 13
- PHP 8.3+
- PostgreSQL
- JWT con `php-open-source-saver/jwt-auth`

## Instalacion

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
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
```

La configuracion JWT se completara durante la implementacion del backend.
