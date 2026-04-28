#!/usr/bin/env sh
set -eu

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

php artisan config:clear >/dev/null 2>&1 || true

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

exec "$@"
