// src/routes/offers.ts
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

export default function offerRoutes(prisma: PrismaClient) {
  const r = Router();

  // Teklif oluştur (sadece giriş yapmış kullanıcı)
  r.post("/", requireAuth, async (req, res) => {
    const S = z.object({
      cleanerId: z.string(),
      price: z.number().int().positive(),
      note: z.string().optional(),
    });
    const p = S.safeParse(req.body);
    if (!p.success) return res.status(400).json(p.error);

    const customerId = (req as any).user.id;

    const cleaner = await prisma.user.findUnique({ where: { id: p.data.cleanerId } });
    if (!cleaner || cleaner.role !== "cleaner") {
      return res.status(400).json({ error: "Invalid cleanerId" });
    }

    const offer = await prisma.offer.create({
      data: {
        customerId,
        cleanerId: p.data.cleanerId,
        price: p.data.price,
        note: p.data.note,
      },
    });

    res.json(offer);
  });

  // Temizlikçinin aldığı teklifler
  r.get("/for-cleaner/:cleanerId", async (req, res) => {
    const offers = await prisma.offer.findMany({
      where: { cleanerId: req.params.cleanerId },
      orderBy: { createdAt: "desc" },
    });
    res.json(offers);
  });

  // Müşterinin gönderdiği teklifler
  r.get("/by-customer/:customerId", async (req, res) => {
    const offers = await prisma.offer.findMany({
      where: { customerId: req.params.customerId },
      orderBy: { createdAt: "desc" },
    });
    res.json(offers);
  });

  return r;
}
