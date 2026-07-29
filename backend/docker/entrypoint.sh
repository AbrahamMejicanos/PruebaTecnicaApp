#!/usr/bin/env sh
set -e

if [ ! -f .env ]; then
  cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
  composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
fi

mkdir -p public/uploads storage/framework/cache storage/framework/sessions storage/framework/views storage/logs

set_env_value() {
  key="$1"
  value="$2"

  KEY="$key" VALUE="$value" php -r '
    $path = ".env";
    $key = getenv("KEY");
    $value = getenv("VALUE");
    $line = $key."=".$value;
    $contents = file_exists($path) ? file($path, FILE_IGNORE_NEW_LINES) : [];
    $found = false;

    foreach ($contents as &$existing) {
        if (str_starts_with($existing, $key."=")) {
            $existing = $line;
            $found = true;
        }
    }

    if (! $found) {
        $contents[] = $line;
    }

    file_put_contents($path, implode(PHP_EOL, $contents).PHP_EOL);
  '
}

get_env_value() {
  key="$1"

  KEY="$key" php -r '
    $path = ".env";
    $key = getenv("KEY");

    if (! file_exists($path)) {
        exit;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES) as $line) {
        if (str_starts_with($line, $key."=")) {
            echo substr($line, strlen($key) + 1);
            exit;
        }
    }
  '
}

if [ -z "${APP_KEY:-}" ]; then
  APP_KEY="$(get_env_value APP_KEY)"

  if [ -z "$APP_KEY" ]; then
    APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    set_env_value APP_KEY "$APP_KEY"
  fi

  export APP_KEY
fi

if [ -z "${JWT_SECRET:-}" ]; then
  JWT_SECRET="$(get_env_value JWT_SECRET)"

  if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="$(php -r 'echo bin2hex(random_bytes(32));')"
    set_env_value JWT_SECRET "$JWT_SECRET"
  fi

  export JWT_SECRET
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
