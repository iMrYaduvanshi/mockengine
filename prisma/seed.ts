import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database seeding shuru ho rahi hai...");

  // 1. Agar pehle se demo project hai to usko clean karo taaki duplicate na bane
  const existingProject = await prisma.project.findUnique({
    where: { slug: "ecommerce-demo" },
  });

  if (existingProject) {
    await prisma.project.delete({
      where: { slug: "ecommerce-demo" },
    });
    console.log("🧹 Purana demo project clean kiya gaya.");
  }

  // 2. Demo Project create karo
  const project = await prisma.project.create({
    data: {
      name: "E-Commerce Demo API",
      slug: "ecommerce-demo",
      description: "Sample mock APIs for frontend testing & mobile development",
      endpoints: {
        create: [
          {
            name: "Get Product Catalog",
            path: "/products",
            method: "GET",
            statusCode: 200,
            delayMs: 300, // 300ms simulated network delay
            errorRate: 0.0,
            responseBody: JSON.stringify({
              status: "success",
              total: 3,
              data: [
                { id: 1, name: "Wireless Headphones", price: 2999, stock: 15, rating: 4.8 },
                { id: 2, name: "Mechanical Keyboard", price: 4499, stock: 8, rating: 4.9 },
                { id: 3, name: "Gaming Mouse", price: 1899, stock: 24, rating: 4.6 },
              ],
            }),
          },
          {
            name: "Checkout Cart",
            path: "/cart/checkout",
            method: "POST",
            statusCode: 201,
            delayMs: 600, // 600ms network delay
            errorRate: 0.0,
            responseBody: JSON.stringify({
              status: "success",
              orderId: "ORD-789012",
              message: "Payment verified and order placed successfully!",
              estimatedDelivery: "3-5 Business Days",
            }),
          },
        ],
      },
    },
  });

  console.log(`✅ Seed complete! Created project: "${project.name}" with slug: "${project.slug}"`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });