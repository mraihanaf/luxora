import { PrismaClient } from "@/@generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return new PrismaClient({} as PrismaClientOptions);
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
};

const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
