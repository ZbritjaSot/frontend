<?php

/**
 * Small Laravel bootstrap helpers for Playwright (e2e DB only).
 * Usage:
 *   DB_DATABASE=zbritjasot_e2e php e2e/helpers/laravel-cli.php <command> ...
 *
 * Commands:
 *   snapshot <email>
 *   set-must-change <email> <0|1>
 *   set-password <email> <password>
 *   create-reset-token <email>
 *   restore <email> <passwordHash> <mustChange 0|1>
 */

declare(strict_types=1);

$scriptDir = dirname(__DIR__);
$backend = realpath($scriptDir.'/../../backend');
if ($backend === false || ! is_file($backend.'/vendor/autoload.php')) {
    fwrite(STDERR, "Backend directory is missing.\n");
    exit(1);
}

// Match e2e/serve-api.sh so Cache::flush clears the same store the API uses.
$e2eEnv = [
    'DB_DATABASE' => getenv('DB_DATABASE') ?: 'zbritjasot_e2e',
    'CACHE_STORE' => getenv('CACHE_STORE') ?: 'file',
    'CACHE_PREFIX' => getenv('CACHE_PREFIX') ?: 'zbritjasot_e2e_',
    'MAIL_MAILER' => getenv('MAIL_MAILER') ?: 'array',
    'QUEUE_CONNECTION' => getenv('QUEUE_CONNECTION') ?: 'sync',
];
foreach ($e2eEnv as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

require $backend.'/vendor/autoload.php';
$app = require $backend.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Modules\Users\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;

$command = $argv[1] ?? '';

if ($command === 'clear-cache') {
    Cache::flush();
    echo json_encode(['ok' => true], JSON_THROW_ON_ERROR).PHP_EOL;
    exit(0);
}

$email = $argv[2] ?? '';

if ($email === '') {
    fwrite(STDERR, "Email is required.\n");
    exit(1);
}

$user = User::query()->where('email', $email)->first();
if ($user === null) {
    fwrite(STDERR, "User not found: {$email}\n");
    exit(1);
}

switch ($command) {
    case 'snapshot':
        echo json_encode([
            'email' => $user->email,
            'password_hash' => $user->password,
            'must_change_password' => (bool) $user->must_change_password,
        ], JSON_THROW_ON_ERROR);
        break;

    case 'set-must-change':
        $flag = ($argv[3] ?? '1') === '1';
        $user->forceFill(['must_change_password' => $flag])->save();
        echo json_encode(['ok' => true, 'must_change_password' => $flag], JSON_THROW_ON_ERROR);
        break;

    case 'set-password':
        $password = $argv[3] ?? '';
        if ($password === '') {
            fwrite(STDERR, "Password is required.\n");
            exit(1);
        }
        // `password` cast hashes on assign — pass plaintext here.
        $user->password = $password;
        $user->must_change_password = false;
        $user->save();
        echo json_encode(['ok' => true], JSON_THROW_ON_ERROR);
        break;

    case 'create-reset-token':
        $token = Password::broker()->createToken($user);
        echo json_encode([
            'email' => $user->email,
            'token' => $token,
        ], JSON_THROW_ON_ERROR);
        break;

    case 'restore':
        $hash = $argv[3] ?? '';
        $must = ($argv[4] ?? '0') === '1';
        if ($hash === '') {
            fwrite(STDERR, "Password hash is required.\n");
            exit(1);
        }
        // Write the stored hash directly so the hashed cast does not double-hash.
        DB::table('users')->where('id', $user->id)->update([
            'password' => $hash,
            'must_change_password' => $must,
        ]);
        echo json_encode(['ok' => true], JSON_THROW_ON_ERROR);
        break;

    default:
        fwrite(STDERR, "Unknown command: {$command}\n");
        exit(1);
}

echo PHP_EOL;
