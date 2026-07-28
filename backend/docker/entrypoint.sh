#!/usr/bin/env sh
set -e

if [ ! -f .env ]; then
  cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --force
fi

if [ -z "${JWT_SECRET:-}" ]; then
  php artisan jwt:secret --force
fi

if [ "${DB_CONNECTION:-}" = "pgsql" ]; then
  echo "Waiting for PostgreSQL at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
  until nc -z "${DB_HOST:-postgres}" "${DB_PORT:-5432}"; do
    sleep 1
  done
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-true}" = "true" ]; then
  php artisan db:seed --force
fi

exec "$@"
