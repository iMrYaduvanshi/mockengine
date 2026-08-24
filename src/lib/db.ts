import { PrismaClient } from "@prisma/client";

// Global object me database client ko temporarily store karne ke liye type definition
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Agar global memory me pehle se client hai to wo use karo, warna naya banao
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// Development mode me client ko global memory me save karke rakho taaki hot reload par naya connection na bane
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;