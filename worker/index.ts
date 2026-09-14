import type { D1Database } from "@cloudflare/workers-types";
import { passwordHash, randomToken, tokenHash, verifyPassword } from "./crypto";
import { authPage } from "./views";

interface Env {
  DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
}
interface User {
  id: string;
  email: string;
  password_hash: string;
  must_change_password: number;
  temporary_expires_at: number | null;
  password_version: number;
}
interface Session extends User {
  token_hash: string;
}
const COOKIE = "__Host-dashboard_session";
const now = () => Math.floor(Date.now() / 1000);
const redirect = (path: string, cookie?: string) =>
  new Response(null, {
    status: 303,
    headers: { Location: path, ...(cookie ? { "Set-Cookie": cookie } : {}) },
  });
function sessionCookie(token: string, seconds: number) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${seconds}`;
}
function html(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
async function sessionFor(request: Request, env: Env) {
  const token = request.headers
    .get("Cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return env.DB.prepare(
    `SELECT u.*, s.token_hash FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND s.password_version = u.password_version`,
  )
    .bind(await tokenHash(token), now())
    .first<Session>();
}
async function limited(env: Env, key: string, maximum: number) {
  const time = now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits(key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END, expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`,
  )
    .bind(key, time + 900, time, time)
    .first<{ attempts: number }>();
  return !row || row.attempts > maximum;
}
async function newSession(env: Env, user: User) {
  const token = randomToken();
  const seconds = user.must_change_password ? 900 : 28800;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now()),
    env.DB.prepare("DELETE FROM rate_limits WHERE expires_at <= ?").bind(now()),
    env.DB.prepare(
      "INSERT INTO sessions(token_hash, user_id, password_version, expires_at) VALUES (?, ?, ?, ?)",
    ).bind(
      await tokenHash(token),
      user.id,
      user.password_version,
      now() + seconds,
    ),
  ]);
  return sessionCookie(token, seconds);
}
async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (!["GET", "HEAD", "POST"].includes(request.method))
    return new Response("Método não permitido", { status: 405 });
  // Check all mutations, including login/logout. No cross-origin form submission.
  if (request.method === "POST" && request.headers.get("Origin") !== url.origin)
    return new Response("Pedido inválido", { status: 403 });
  if (
    request.method === "POST" &&
    Number(request.headers.get("Content-Length") ?? 0) > 4096
  )
    return new Response("Pedido demasiado grande", { status: 413 });
  const session = await sessionFor(request, env);
  if (url.pathname === "/auth/logout" && request.method === "POST") {
    if (session)
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
        .bind(session.token_hash)
        .run();
    return redirect("/login", sessionCookie("", 0));
  }
  if (url.pathname === "/auth/login" && request.method === "POST") {
    const ip = request.headers.get("CF-Connecting-IP") ?? "local";
    if (await limited(env, `ip:${await tokenHash(ip)}`, 20))
      return html(
        authPage("login", {
          error: "Demasiadas tentativas. Tenta novamente dentro de 15 minutos.",
        }),
        429,
      );
    const body = await request.text();
    if (body.length > 4096)
      return new Response("Pedido demasiado grande", { status: 413 });
    const form = new URLSearchParams(body);
    const email = (form.get("email") ?? "").trim().toLowerCase();
    const password = form.get("password") ?? "";
    // One global account bucket also limits distributed attempts and unknown-email floods.
    if (await limited(env, "login:account", 30))
      return html(
        authPage("login", {
          error: "Demasiadas tentativas. Tenta novamente dentro de 15 minutos.",
        }),
        429,
      );
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
      .bind(email.slice(0, 254))
      .first<User>();
    const dummy =
      "pbkdf2-sha256$100000$" + "0".repeat(64) + "$" + "0".repeat(64);
    const valid = await verifyPassword(
      password.slice(0, 128),
      user?.password_hash ?? dummy,
    );
    if (
      !user ||
      !valid ||
      !password ||
      password.length > 128 ||
      (user.must_change_password &&
        (!user.temporary_expires_at || user.temporary_expires_at < now()))
    )
      return html(
        authPage("login", {
          error:
            "Email ou palavra-passe inválidos, ou acesso temporário expirado.",
        }),
        401,
      );
    if (session)
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
        .bind(session.token_hash)
        .run();
    return redirect(
      user.must_change_password ? "/account/password" : "/",
      await newSession(env, user),
    );
  }
  if (!session)
    return url.pathname === "/login" && request.method === "GET"
      ? html(authPage("login"))
      : redirect("/login");
  if (url.pathname === "/account/password" && request.method === "GET")
    return html(
      authPage("password", {
        csrf: session.token_hash,
        required: !!session.must_change_password,
      }),
    );
  if (url.pathname === "/auth/password" && request.method === "POST") {
    const body = await request.text();
    if (body.length > 4096)
      return new Response("Pedido demasiado grande", { status: 413 });
    const form = new URLSearchParams(body);
    if (form.get("csrf") !== session.token_hash)
      return new Response("Pedido inválido", { status: 403 });
    const error = (message: string, status = 400) =>
      html(
        authPage("password", {
          error: message,
          csrf: session.token_hash,
          required: !!session.must_change_password,
        }),
        status,
      );
    if (await limited(env, `password:${session.id}`, 10))
      return error(
        "Demasiadas tentativas. Tenta novamente dentro de 15 minutos.",
        429,
      );
    const current = form.get("password") ?? "";
    const next = form.get("newPassword") ?? "";
    if (
      current.length > 128 ||
      !(await verifyPassword(current, session.password_hash))
    )
      return error("A palavra-passe atual não está correta.");
    if (next.length < 12 || next.length > 128 || next.trim().length < 12)
      return error("A nova palavra-passe deve ter entre 12 e 128 caracteres.");
    if (next !== form.get("confirmation"))
      return error("As palavras-passe não coincidem.");
    if (next === current)
      return error("Escolhe uma palavra-passe diferente da atual.");
    const result = await env.DB.prepare(
      "UPDATE users SET password_hash = ?, must_change_password = 0, temporary_expires_at = NULL, password_version = password_version + 1 WHERE id = ? AND password_version = ?",
    )
      .bind(await passwordHash(next), session.id, session.password_version)
      .run();
    if (result.meta.changes !== 1)
      return redirect("/login", sessionCookie("", 0));
    // Version checking invalidates every existing session atomically with the password update.
    return redirect(
      "/",
      await newSession(env, {
        ...session,
        must_change_password: 0,
        password_version: session.password_version + 1,
      }),
    );
  }
  if (session.must_change_password) return redirect("/account/password");
  if (url.pathname === "/login") return redirect("/");
  if (request.method === "POST")
    return new Response("Não encontrado", { status: 404 });
  return env.ASSETS.fetch(request);
}
const worker = {
  async fetch(request: Request, env: Env) {
    let result: Response;
    try {
      result = await handle(request, env);
    } catch {
      result = new Response(
        "Não foi possível concluir o pedido. Tenta novamente mais tarde.",
        { status: 503 },
      );
    }
    const response = new Response(result.body, result);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "same-origin");
    response.headers.set("Strict-Transport-Security", "max-age=31536000");
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    return response;
  },
};
export default worker;
