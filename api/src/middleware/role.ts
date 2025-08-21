import { NextFunction, Request, Response } from "express";

export function requireRole(role: "customer" | "cleaner") {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user;
    if (!u) return res.status(401).json({ error: "Unauthorized" });
    if (u.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
