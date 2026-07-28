#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
SKIP_DOCKER="${SKIP_DOCKER:-0}"

cd "$BACKEND"

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer no esta disponible en PATH. Instala Composer y vuelve a ejecutar este script."
  exit 1
fi

composer install

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

php artisan key:generate --force
php artisan jwt:secret --force

env_value() {
  local key="$1"
  grep -E "^${key}=" .env | head -n 1 | cut -d '=' -f 2- | sed 's/^"//;s/"$//'
}

SUPERUSER_EMAIL="${SUPERUSER_EMAIL:-$(env_value SUPERUSER_EMAIL)}"
SUPERUSER_PASSWORD="${SUPERUSER_PASSWORD:-$(env_value SUPERUSER_PASSWORD)}"
SUPERUSER_NAME="${SUPERUSER_NAME:-$(env_value SUPERUSER_NAME)}"

if [ -z "$SUPERUSER_EMAIL" ] || [ -z "$SUPERUSER_PASSWORD" ]; then
  echo "Configura SUPERUSER_EMAIL y SUPERUSER_PASSWORD en backend/.env antes de ejecutar este script."
  echo "Tambien puedes exportarlas antes de correrlo:"
  echo "SUPERUSER_EMAIL=tu@email.com SUPERUSER_PASSWORD=tu-password ./scripts/setup-backend.sh"
  exit 1
fi

sed -i.bak "s|^SUPERUSER_EMAIL=.*|SUPERUSER_EMAIL=\"$SUPERUSER_EMAIL\"|" .env
sed -i.bak "s|^SUPERUSER_PASSWORD=.*|SUPERUSER_PASSWORD=\"$SUPERUSER_PASSWORD\"|" .env
if [ -n "$SUPERUSER_NAME" ]; then
  sed -i.bak "s|^SUPERUSER_NAME=.*|SUPERUSER_NAME=\"$SUPERUSER_NAME\"|" .env
fi
rm -f .env.bak

if [ "$SKIP_DOCKER" != "1" ]; then
  if command -v docker >/dev/null 2>&1; then
    cd "$ROOT"
    docker compose up -d postgres
    cd "$BACKEND"
  else
    echo "Docker no esta disponible. Se omite el levantamiento automatico de PostgreSQL."
    echo "Asegurate de tener PostgreSQL activo con la configuracion de backend/.env."
  fi
fi

php artisan migrate:fresh --seed

echo ""
echo "Backend listo."
echo "API local: http://localhost:8000/api"
echo "Superusuario: $SUPERUSER_EMAIL"
echo "Ejecuta: php artisan serve"
