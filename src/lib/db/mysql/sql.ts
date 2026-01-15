import { PrismaClient } from "../../../../prisma-mysql-client";

const globalForPrisma = global as unknown as { prismaMySQL?: PrismaClient };

export const prisma =
  globalForPrisma.prismaMySQL ||
  new PrismaClient({
    log: ["query", "error", "warn"], // 可选：调试时查看 SQL
  });
globalForPrisma.prismaMySQL = prisma;
