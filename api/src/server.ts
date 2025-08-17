// src/server.ts
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRoutes } from "./routes/auth";
import offerRoutes from "./routes/offers";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Temizlikçiler
app.get("/cleaners", async (_req, res) => {
  const cleaners = await prisma.user.findMany({
    where: { role: "cleaner" },
    select: { id: true, name: true, profileImageUrl: true, basePrice: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(cleaners);
});

// Müşteriler
app.get("/customers", async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: { id: true, name: true, email: true, profileImageUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(customers);
});

// Tek endpoint: gruplu dönüş
app.get("/users/grouped", async (_req, res) => {
  try {
    const [cleaners, customers] = await Promise.all([
      prisma.user.findMany({
        where: { role: "cleaner" },
        select: { id: true, name: true, profileImageUrl: true, basePrice: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "customer" },
        select: { id: true, name: true, email: true, profileImageUrl: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({ cleaners, customers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

// Auth & Offers
app.use("/auth", authRoutes(prisma));
app.use("/offers", offerRoutes(prisma));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
