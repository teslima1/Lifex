import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "admin@lifexclinic.com";
  const password = "Admin@2026";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✓ Admin user already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await db.user.create({
    data: {
      name: "LIFEX Admin",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✓ Admin user created:");
  console.log("  Email:   ", admin.email);
  console.log("  Password:", password);
  console.log("  ID:      ", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
