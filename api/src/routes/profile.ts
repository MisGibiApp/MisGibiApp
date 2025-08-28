import { Gender, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";

export default function profileRoutes(prisma: PrismaClient) {
  const r = Router();

  const phoneRegex = /^(\+?\d{1,3})?[\s.-]?\d{10,14}$/;

  // ----------------- SCHEMAS -----------------
  const CleanerProfileSchema = z.object({
    city: z.string().min(1),
    district: z.string().min(1),
    regions: z.array(z.string()).min(1),
    gender: z.nativeEnum(Gender),
    basePrice: z.number().int().positive().optional(),
    profileImageUrl: z.string().url().optional(),
    phone: z.string().optional(),
  });

  const CustomerProfileSchema = z.object({
    city: z.string().min(1),
    district: z.string().min(1),
    regions: z.array(z.string()).min(1),
    gender: z.nativeEnum(Gender),
    phone: z.string().regex(phoneRegex, "Invalid phone number").optional(),
    profileImageUrl: z.string().url().optional(),
  });

  // ----------------- CLEANER PROFİL -----------------
  r.post("/cleaner", requireAuth, requireRole("cleaner"), async (req, res) => {
    const p = CleanerProfileSchema.safeParse(req.body);
    if (!p.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: p.error.flatten(),
      });
    }

    const userIdRaw = (req as any).user?.id;
    const userId = Number(userIdRaw);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: "Invalid user id from token" });
    }

    const { city, district, regions, gender, basePrice, profileImageUrl, phone } = p.data;

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { city, district, regions, gender, basePrice, profileImageUrl, phone },
      });

      return res.json({ user: updated });
    } catch (e: any) {
      console.error("Cleaner profile update error:", e);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // ----------------- CUSTOMER PROFİL -----------------
  r.post("/customer", requireAuth, requireRole("customer"), async (req, res) => {
    const p = CustomerProfileSchema.safeParse(req.body);
    if (!p.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: p.error.flatten(),
      });
    }

    const userIdRaw = (req as any).user?.id;
    const userId = Number(userIdRaw);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ error: "Invalid user id from token" });
    }

    const { city, district, regions, gender, phone, profileImageUrl } = p.data;

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { city, district, regions, gender, phone, profileImageUrl },
      });

      return res.json({ user: updated });
    } catch (e: any) {
      console.error("Customer profile update error:", e);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // ----------------- ME ENDPOINT -----------------
  r.get("/me", requireAuth, async (req, res) => {
    try {
      const userIdRaw = (req as any).user?.id;
      const userId = Number(userIdRaw);
      if (!userId || isNaN(userId)) {
        return res.status(401).json({ error: "Invalid user id from token" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          district: true,
          street: true,
          profileImageUrl: true,
          gender: true,
          regions: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(user);
    } catch (e: any) {
      console.error("Fetch /me error:", e);
      return res.status(500).json({ error: "Server error" });
    }
  });

  return r;
}
