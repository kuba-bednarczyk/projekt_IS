require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./src/generated/prisma");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const userPassword = await bcrypt.hash("user123", salt);

  // utworzenie admina
  await prisma.user.upsert({
    where: { email: "admin@test.pl" },
    update: {},
    create: {
      nickname: "Admin",
      email: "admin@test.pl",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // user
  await prisma.user.upsert({
    where: { email: "user@test.pl" },
    update: {},
    create: {
      nickname: "User",
      email: "user@test.pl",
      password: userPassword,
      role: "USER",
    },
  });

  console.log(
    "Database was successfully seeded with 2 users.",
  );
}

main()
  .catch((e) => {
    console.error("Error occured:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
