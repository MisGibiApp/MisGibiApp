import jwt from "jsonwebtoken";
export function signToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
}
export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
}
