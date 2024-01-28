import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function main() {
  const newLink = await prisma.link.create({
    data: {
      description: 'Fullstack tutorial for GraphQL',
      url: 'www.howtographql.com',
    },
  })
  console.log({ newLink });

  const allLinks = await prisma.link.findMany();
  console.log({ allLinks });

  prisma.$disconnect();
}
