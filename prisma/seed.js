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
const crypto = require("crypto");

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/fintrack";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getOrGeneratePassword(envVarName, accountLabel) {
  const envVal = process.env[envVarName];
  if (envVal && envVal.trim().length >= 8) {
    return { password: envVal.trim(), isGenerated: false };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[SECURITY ERROR] ${envVarName} must be explicitly defined with at least 8 characters when seeding in production environments.`
    );
  }

  // Generate cryptographically secure random password for non-production environments
  const randomPass = crypto.randomBytes(12).toString("base64url") + "!Aa1";
  console.warn(
    `[SECURITY NOTICE] No ${envVarName} specified. Generated secure temporary password for ${accountLabel}: ${randomPass}`
  );
  return { password: randomPass, isGenerated: true };
}

async function main() {
  console.log("Seeding admin account...");

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@fintrack.app").toLowerCase().trim();
  const adminName = process.env.ADMIN_NAME || "FinTrack Admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`[INFO] Admin account already exists for ${existingAdmin.email} (ID: ${existingAdmin.id}).`);

    const updateData = {
      role: "ADMIN",
      status: "ACTIVE",
      isVerified: true,
      name: adminName,
    };

    // If an explicit ADMIN_PASSWORD is provided in environment, update the password
    if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length >= 8) {
      updateData.password = await bcrypt.hash(process.env.ADMIN_PASSWORD.trim(), 10);
      console.log(`[INFO] Updated admin password from ADMIN_PASSWORD environment variable.`);
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: updateData,
    });

    console.log(`[OK] Confirmed admin account: ${updatedAdmin.email} (${updatedAdmin.name}) [ROLE: ADMIN]`);
  } else {
    // Admin does not exist: create it
    const adminPassInfo = getOrGeneratePassword("ADMIN_PASSWORD", adminEmail);
    const adminHashedPassword = await bcrypt.hash(adminPassInfo.password, 10);

    const createdAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminHashedPassword,
        name: adminName,
        role: "ADMIN",
        status: "ACTIVE",
        isVerified: true,
        provider: "credentials",
      },
    });

    console.log(`[CREATED] Seeded new admin: ${createdAdmin.email} (${createdAdmin.name}) [ROLE: ADMIN]`);
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
