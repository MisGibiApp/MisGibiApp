import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization") || "";
  const [, token] = header.split(" ");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = verifyToken(token);
    (req as any).user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
