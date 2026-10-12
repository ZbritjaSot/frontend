import { execFileSync } from "node:child_process";
import path from "node:path";

const cli = path.join(__dirname, "laravel-cli.php");
const backendEnv = {
  ...process.env,
  DB_DATABASE: process.env.E2E_DB_DATABASE ?? "zbritjasot_e2e",
  CACHE_STORE: process.env.E2E_CACHE_STORE ?? "file",
  CACHE_PREFIX: process.env.E2E_CACHE_PREFIX ?? "zbritjasot_e2e_",
  MAIL_MAILER: "array",
  QUEUE_CONNECTION: "sync",
};

function run(args: string[]): string {
  return execFileSync("php", [cli, ...args], {
    encoding: "utf8",
    env: backendEnv,
  }).trim();
}

/** Flush Laravel cache (login throttles, etc.) between heavy e2e flows. */
export function clearLaravelCache(): void {
  run(["clear-cache"]);
}

export type UserSnapshot = {
  email: string;
  password_hash: string;
  must_change_password: boolean;
};

export function snapshotUser(email: string): UserSnapshot {
  return JSON.parse(run(["snapshot", email])) as UserSnapshot;
}

export function setMustChangePassword(email: string, value: boolean): void {
  run(["set-must-change", email, value ? "1" : "0"]);
}

export function setPassword(email: string, password: string): void {
  run(["set-password", email, password]);
}

export function createResetToken(email: string): { email: string; token: string } {
  return JSON.parse(run(["create-reset-token", email])) as {
    email: string;
    token: string;
  };
}

export function restoreUser(snapshot: UserSnapshot): void {
  run([
    "restore",
    snapshot.email,
    snapshot.password_hash,
    snapshot.must_change_password ? "1" : "0",
  ]);
}
