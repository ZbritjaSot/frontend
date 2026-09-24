#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
backend="$(cd "$script_dir/../../backend" && pwd)"
cd "$backend"

php "$script_dir/create-e2e-database.php" "$backend"

export DB_DATABASE=zbritjasot_e2e
export APP_URL=http://localhost:8001
export FRONTEND_URL=http://localhost:3001
export SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3001,127.0.0.1,127.0.0.1:3001

php artisan migrate:fresh --seed --force
# Serve from public/ so the router finds index.php, and so these exports reach PHP.
# `artisan serve` only forwards $_ENV, which still has the values loaded from .env.
cd public
exec php -S 127.0.0.1:8001 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
