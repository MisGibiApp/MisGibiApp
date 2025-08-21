import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Mevcut koda uyumlu payload tipi:
type JwtPayloadIn = { id: string; role: "customer" | "cleaner"; email?: string };
type JwtPayloadOut = { sub: string; role: "customer" | "cleaner"; email?: string };

export function signToken(payload: JwtPayloadIn) {
  const out: JwtPayloadOut = { sub: payload.id, role: payload.role, email: payload.email };
  return jwt.sign(out, JWT_SECRET, { algorithm: "HS256", expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayloadOut {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadOut;
}
