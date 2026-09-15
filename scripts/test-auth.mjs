import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomBytes, pbkdf2Sync } from "node:crypto";

// Isolated local D1 only. Never runs against a remote deployment.
const base = "http://localhost:8787";
const credentials = {
  email: "auth-test@localhost.invalid",
  password: randomBytes(18).toString("base64url"),
};
const salt = randomBytes(32).toString("hex");
const hash = `pbkdf2-sha256$100000$${salt}$${pbkdf2Sync(credentials.password, salt, 100000, 32, "sha256").toString("hex")}`;
mkdirSync(".private", { recursive: true });
writeFileSync(
  ".private/test-seed.sql",
  `DELETE FROM sessions WHERE user_id = 'auth-test'; DELETE FROM users WHERE id = 'auth-test'; DELETE FROM rate_limits; INSERT INTO users (id, email, password_hash, must_change_password, temporary_expires_at) VALUES ('auth-test', '${credentials.email}', '${hash}', 1, ${Math.floor(Date.now() / 1000) + 3600});`,
);
execFileSync(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "d1",
    "execute",
    "dashboard-geral-auth",
    "--local",
    "--file=.private/test-seed.sql",
  ],
  { stdio: "ignore" },
);
process.on("exit", () => {
  execFileSync(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "dashboard-geral-auth",
      "--local",
      "--command=DELETE FROM sessions WHERE user_id = 'auth-test'; DELETE FROM users WHERE id = 'auth-test'; DELETE FROM rate_limits;",
    ],
    { stdio: "ignore" },
  );
});
let cookie = "";
async function request(path, fields, origin = base) {
  const response = await fetch(base + path, {
    method: fields ? "POST" : "GET",
    redirect: "manual",
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(fields
        ? {
            Origin: origin,
            "Content-Type": "application/x-www-form-urlencoded",
          }
        : {}),
    },
    body: fields ? new URLSearchParams(fields) : undefined,
  });
  return response;
}
function acceptCookie(response) {
  cookie = response.headers.get("set-cookie")?.split(";")[0] ?? "";
  assert.ok(cookie);
}
async function login(password) {
  return request("/auth/login", { email: credentials.email, password });
}
assert.equal((await request("/")).headers.get("location"), "/login");
assert.equal((await request("/index.txt")).headers.get("location"), "/login");
assert.equal(
  (await request("/_next/static/test.js")).headers.get("location"),
  "/login",
);
assert.equal(
  (
    await request(
      "/auth/login",
      { email: credentials.email, password: credentials.password },
      "https://elsewhere.example",
    )
  ).status,
  403,
);
assert.equal((await login("wrong-password")).status, 401);
let response = await login(credentials.password);
assert.equal(response.status, 303);
assert.equal(response.headers.get("location"), "/account/password");
assert.match(
  response.headers.get("set-cookie"),
  /HttpOnly; Secure; SameSite=Strict/,
);
acceptCookie(response);
const firstSession = cookie;
assert.equal((await request("/")).headers.get("location"), "/account/password");
assert.equal(
  (await request("/index.txt")).headers.get("location"),
  "/account/password",
);
const passwordPage = await (await request("/account/password")).text();
const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(passwordPage)?.[1];
assert.ok(csrf);
const next = `  Ação+&=%"'漢字-${randomBytes(18).toString("base64url")}  `;
assert.equal(
  (
    await request("/auth/password", {
      csrf: "wrong",
      password: credentials.password,
      newPassword: next,
      confirmation: next,
    })
  ).status,
  403,
);
assert.equal(
  (
    await request("/auth/password", {
      csrf,
      password: credentials.password,
      newPassword: "short",
      confirmation: "short",
    })
  ).status,
  400,
);
assert.equal(
  (
    await request("/auth/password", {
      csrf,
      password: credentials.password,
      newPassword: next,
      confirmation: "different",
    })
  ).status,
  400,
);
assert.equal(
  (
    await request("/auth/password", {
      csrf,
      password: credentials.password,
      newPassword: credentials.password,
      confirmation: credentials.password,
    })
  ).status,
  400,
);
response = await request("/auth/password", {
  csrf,
  password: credentials.password,
  newPassword: next,
  confirmation: next,
});
assert.equal(response.status, 303);
assert.equal(response.headers.get("location"), "/");
acceptCookie(response);
assert.notEqual(cookie, firstSession);
const authenticated = cookie;
cookie = firstSession;
assert.equal((await request("/")).headers.get("location"), "/login");
cookie = authenticated;
response = await request("/");
assert.equal(response.status, 200);
assert.match(await response.text(), /Dashboard/);
assert.equal(response.headers.get("cache-control"), "no-store");
assert.equal(
  (await request("/auth/logout", {})).headers.get("location"),
  "/login",
);
assert.equal((await request("/")).headers.get("location"), "/login");
cookie = "";
assert.equal((await login(credentials.password)).status, 401);
response = await login(next);
assert.equal(response.headers.get("location"), "/");
acceptCookie(response);
await request("/auth/logout", {});
cookie = "";
for (let i = 0; i < 21; i++) response = await login("invalid-password");
assert.equal(response.status, 429);
console.log(
  "PASS: server protection, first-login change, CSRF, password validation, session rotation, logout, old password rejection and rate limiting.",
);
