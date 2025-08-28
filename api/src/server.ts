import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { authRoutes } from "./routes/auth";
import offerRoutes from "./routes/offers";
import profileRoutes from "./routes/profile";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Cleaner list
app.get("/cleaners", async (_req, res) => {
  const cleaners = await prisma.user.findMany({
    where: { role: "cleaner" },
    select: { id: true, name: true, profileImageUrl: true, basePrice: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(cleaners);
});

// Customer list
app.get("/customers", async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: { id: true, name: true, email: true, profileImageUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(customers);
});

// Grouped
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

// Routes
app.use("/auth", authRoutes(prisma));
app.use("/offers", offerRoutes(prisma));
app.use("/profile", profileRoutes(prisma));

app.get("/", (_req, res) => res.send("Backend çalışıyor 🚀"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
