import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]; // ✅ küçük/büyük harf sorunu yok
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const parts = (authHeader as string).split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  const token = parts[1];
  try {
    const payload = verifyToken(token) as {
      sub: string;
      role: string;
      email: string;
    };

    (req as any).user = {
      id: payload.sub,      // ✅ Prisma update artık id bulacak
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
