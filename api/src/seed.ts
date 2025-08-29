import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync("123456", 10);

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      role: "customer",
      name: "Müşteri",
      email: "customer@example.com",
      passwordHash: hash,
    },
  });

  console.log("Seed tamam.");
}

main().finally(() => prisma.$disconnect());
