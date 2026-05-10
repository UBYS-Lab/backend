#!/usr/bin/env sh
set -eu

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

php artisan config:clear >/dev/null 2>&1 || true
php artisan route:clear  >/dev/null 2>&1 || true

# MongoDB bağlantısını önceden ısıt (cold start gecikmesini önler)
php -r "
  require '/var/www/html/vendor/autoload.php';
  \$app = require '/var/www/html/bootstrap/app.php';
  \$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
  try { DB::connection('mongodb')->command(['ping'=>1]); } catch(Exception \$e) {}
" >/dev/null 2>&1 || true

exec "$@"
