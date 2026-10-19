if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch (_e) {
    // .env already loaded or not found
  }
}

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const bcrypt = require("bcryptjs");

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/fintrack";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding accounts...");

  const testPassword =
    process.env.TEST_ACCOUNT_PASSWORD ||
    process.env.TEST_PASSWORD ||
    "Fintrack@911";

  const mainPassword =
    process.env.MAIN_ACCOUNT_PASSWORD ||
    process.env.MAIN_PASSWORD ||
    "Fintrack@455";

  const users = [
    {
      email: "test@mail.com",
      passwordRaw: testPassword,
      name: "Test User",
    },
    {
      email: "mandeepsinghbuilds@gmail.com",
      passwordRaw: mainPassword,
      name: "Mandeep Singh",
    },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.passwordRaw, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        name: u.name,
      },
      create: {
        email: u.email,
        password: hashedPassword,
        name: u.name,
      },
    });
    console.log(`Seeded user: ${user.email} (${user.name})`);
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
