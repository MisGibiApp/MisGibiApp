import { Gender, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";

export default function profileRoutes(prisma: PrismaClient) {
  const r = Router();

  // ---- Schemas ----
  const phoneRegex = /^(\+?\d{1,3})?[\s.-]?\d{10,14}$/; // basit kontrol, istersen kaldır/özelleştir

const CleanerProfileSchema = z.object({
  city: z.string().min(1),
  district: z.string().min(1),
  regions: z.array(z.string()).min(1),
  gender: z.nativeEnum(Gender), // <-- artık Prisma'nın enumunu kullanıyor
  basePrice: z.number().int().positive().optional(),
  profileImageUrl: z.string().url().optional(),
  phone: z.string().optional(),
});

  const CustomerProfileSchema = z.object({
    city: z.string().min(1),
    district: z.string().min(1),
    street: z.string().min(1),
    phone: z.string().regex(phoneRegex, "Invalid phone number").optional(),
    profileImageUrl: z.string().url().optional(),
  });

  // ---- CLEANER profilini güncelle ----
  r.post("/cleaner", requireAuth, requireRole("cleaner"), async (req, res) => {
    const p = CleanerProfileSchema.safeParse(req.body);
    if (!p.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: p.error.flatten(),
      });
    }

    const userId = (req as any).user.id as string;
    const { city, district, regions, gender, basePrice, profileImageUrl, phone } = p.data;

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          city,
          district,
          regionsJson: JSON.stringify(regions),
          gender: gender as Gender,
          basePrice,
          profileImageUrl,
          phone,
        },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          city: true,
          district: true,
          gender: true,
          basePrice: true,
          profileImageUrl: true,
          phone: true,
          // regionsJson'ı seçmiyoruz; aşağıda parse edip "regions" olarak ekleyeceğiz
        },
      });

      // regions alanını hydrate et
      const regionsParsed = regions; // zaten elimizde request’ten de var
      return res.json({ user: { ...updated, regions: regionsParsed } });
    } catch (e: any) {
      if (e?.code === "P2002") {
        // örn: phone unique ihlali
        return res.status(409).json({ error: "Unique constraint failed (probably phone already used)" });
      }
      return res.status(500).json({ error: "Server error" });
    }
  });

  // ---- CUSTOMER profilini güncelle ----
  r.post("/customer", requireAuth, requireRole("customer"), async (req, res) => {
    const p = CustomerProfileSchema.safeParse(req.body);
    if (!p.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: p.error.flatten(),
      });
    }

    const userId = (req as any).user.id as string;
    const { city, district, street, phone, profileImageUrl } = p.data;

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          city,
          district,
          street,
          phone,
          profileImageUrl,
        },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          city: true,
          district: true,
          street: true,
          phone: true,
          profileImageUrl: true,
        },
      });

      return res.json({ user: updated });
    } catch (e: any) {
      if (e?.code === "P2002") {
        return res.status(409).json({ error: "Unique constraint failed (probably phone already used)" });
      }
      return res.status(500).json({ error: "Server error" });
    }
  });

  return r;
}
