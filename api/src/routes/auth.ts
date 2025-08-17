import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { signToken } from "../utils/jwt";

// 🔁 default yerine named export
export function authRoutes(prisma: PrismaClient) {
  const r = Router();

  const Register = z.object({
    role: z.enum(["customer", "cleaner"]),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    profileImageUrl: z.string().optional(),
    basePrice: z.number().optional(),
  });

  r.post("/register", async (req, res) => {
    const p = Register.safeParse(req.body);
    if (!p.success) return res.status(400).json(p.error);
    const { email, password, role, name, profileImageUrl, basePrice } = p.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already used" });

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { role: role as Role, name, email, passwordHash, profileImageUrl, basePrice },
      select: { id: true, role: true, name: true, email: true, profileImageUrl: true, basePrice: true },
    });

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user });
  });

  const Login = z.object({ email: z.string().email(), password: z.string().min(6) });

  r.post("/login", async (req, res) => {
    const p = Login.safeParse(req.body);
    if (!p.success) return res.status(400).json(p.error);
    const { email, password } = p.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.passwordHash))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: user.id, role: user.role });
    res.json({
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
  });

  return r;
}
