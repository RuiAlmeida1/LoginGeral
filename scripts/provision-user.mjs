// Creates an initial user only; never resets an existing account.
// Credential files are local, ignored by Git, and never part of the web build.
import { randomBytes, pbkdf2Sync } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const remote = process.argv.includes("--remote");
const target = remote ? "remote" : "local";
const directory = ".private";
const credentials = `${directory}/${target}-credentials.json`;
if (existsSync(credentials))
  throw new Error("Credential file already exists. Refusing to overwrite it.");
const password = randomBytes(18).toString("base64url");
const salt = randomBytes(32).toString("hex");
const hash = `pbkdf2-sha256$100000$${salt}$${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex")}`;
const expires = Math.floor(Date.now() / 1000) + 48 * 3600;
mkdirSync(directory, { recursive: true });
const sql = `${directory}/${target}-initial-user.sql`;
writeFileSync(
  sql,
  `INSERT INTO users (id, email, password_hash, must_change_password, temporary_expires_at) VALUES ('rui-almeida', 'rui.almeida@staples.pt', '${hash}', 1, ${expires});\n`,
  { mode: 0o600 },
);
execFileSync(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "d1",
    "execute",
    "dashboard-geral-auth",
    remote ? "--remote" : "--local",
    `--file=${sql}`,
  ],
  { stdio: "inherit" },
);
writeFileSync(
  credentials,
  JSON.stringify({
    email: "rui.almeida@staples.pt",
    password,
    expiresAt: new Date(expires * 1000).toISOString(),
  }),
  { mode: 0o600 },
);
if (remote)
  writeFileSync(
    `${directory}/primeiro-acesso.txt`,
    `Dashboard Geral\nhttps://logingeral.ruimiguelalmeida-090.workers.dev/login\n\nEmail: rui.almeida@staples.pt\nPalavra-passe temporária: ${password}\nVálida até: ${new Date(expires * 1000).toISOString()}\n\nA alteração é obrigatória no primeiro acesso.\n`,
    { mode: 0o600 },
  );
console.log(`User provisioned. Credentials saved locally in ${credentials}.`);
