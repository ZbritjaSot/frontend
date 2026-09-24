<?php

$backend = $argv[1] ?? '';
if ($backend === '' || ! is_file($backend.'/vendor/autoload.php')) {
    fwrite(STDERR, "Backend directory is missing.\n");
    exit(1);
}

require $backend.'/vendor/autoload.php';
$app = require $backend.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$connection = config('database.default');
if ($connection !== 'mysql') {
    fwrite(STDERR, "E2E expects the MySQL connection from .env.\n");
    exit(1);
}

$config = config('database.connections.mysql');
$pdo = new PDO(
    sprintf('mysql:host=%s;port=%s', $config['host'], $config['port']),
    (string) $config['username'],
    (string) $config['password'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
);
$pdo->exec(
    'CREATE DATABASE IF NOT EXISTS `zbritjasot_e2e` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
);
