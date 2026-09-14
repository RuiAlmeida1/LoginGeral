const encoder = new TextEncoder();
const ITERATIONS = 100_000; // Web Crypto limit in the Workers runtime.

export function randomToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}
function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
export async function tokenHash(token: string) {
  return toHex(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", encoder.encode(token)),
    ),
  );
}
export async function passwordHash(password: string, salt = randomToken()) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return `pbkdf2-sha256$${ITERATIONS}$${salt}$${toHex(new Uint8Array(bits))}`;
}
export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (
    parts.length !== 4 ||
    parts[0] !== "pbkdf2-sha256" ||
    parts[1] !== String(ITERATIONS)
  )
    return false;
  const derived = await passwordHash(password, parts[2]);
  let difference = derived.length ^ stored.length;
  for (let i = 0; i < derived.length; i++)
    difference |= derived.charCodeAt(i) ^ (stored.charCodeAt(i) || 0);
  return difference === 0;
}
