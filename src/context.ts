import { YogaInitialContext } from 'graphql-yoga';
import { PrismaClient, User } from '@prisma/client';
import { authenticateUser } from './auth';

export type ContextValue = {
  prisma: PrismaClient;
  currentUser: User | null;
};

const prisma = new PrismaClient();

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<ContextValue> {
  return {
    prisma,
    currentUser: await authenticateUser(prisma, initialContext.request),
  };
}
