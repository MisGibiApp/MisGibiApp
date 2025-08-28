import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { signToken } from "../utils/jwt";

export function authRoutes(prisma: PrismaClient) {
  const r = Router();

  // -------------------------------
  // 📌 Register schema
  // -------------------------------
  const RegisterSchema = z.object({
    role: z.enum(["customer", "cleaner"]),
    name: z.string().min(2, "İsim en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    profileImageUrl: z.string().url().optional(),
    basePrice: z.number().int().positive().optional(),
  });

  // -------------------------------
  // 📌 Register endpoint
  // -------------------------------
  r.post("/register", async (req, res) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { email, password, role, name, profileImageUrl, basePrice } =
      parsed.data;

    try {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return res.status(409).json({ error: "Email already used" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          role: role as Role,
          name,
          email,
          passwordHash,
          profileImageUrl,
          basePrice,
        },
      });

      // ⚡ sub'ı string'e çeviriyoruz
      const token = signToken({
        id: String(user.id),
        role: user.role,
        email: user.email,
      });

      return res.json({
        token,
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          basePrice: user.basePrice,
        },
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // -------------------------------
  // 📌 Login schema
  // -------------------------------
  const LoginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  });

  // -------------------------------
  // 📌 Login endpoint
  // -------------------------------
  r.post("/login", async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // ⚡ yine string'e çeviriyoruz
      const token = signToken({
        id: String(user.id),
        role: user.role,
        email: user.email,
      });

      return res.json({
        token,
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          basePrice: user.basePrice,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  return r;
}
