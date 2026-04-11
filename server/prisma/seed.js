const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.contact.deleteMany();

  const contacts = [
    { firstName: "Alice", lastName: "Johnson", email: "alice@example.com", phone: "555-0101" },
    { firstName: "Bob", lastName: "Smith", email: "bob@example.com", phone: "555-0102" },
    { firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", phone: null },
    { firstName: "Diana", lastName: "Prince", email: "diana@example.com", phone: "555-0104" },
    { firstName: "Eve", lastName: "Davis", email: "eve@example.com", phone: "555-0105" },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact });
  }

  console.log(`Seeded ${contacts.length} contacts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
