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
echo "Credenciales demo: demo@example.com / password"
echo "Ejecuta: php artisan serve"
