import { NextFunction, Request, Response } from "express";

export function requireRole(...roles: Array<"customer" | "cleaner">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { id: string; role: "customer" | "cleaner" } | undefined;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
