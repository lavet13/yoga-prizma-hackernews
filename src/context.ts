import { YogaInitialContext } from 'graphql-yoga';
import { PrismaClient, User } from '@prisma/client';
import { authenticateUser } from './auth';
import { pubSub } from './pubsub';
// import { inspect } from './utils/debug/inspect';

export type ContextValue = {
  prisma: PrismaClient;
  currentUser: User | null;
  pubSub: typeof pubSub;
};

const prisma = new PrismaClient();

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<ContextValue> {
  return {
    prisma,
    currentUser: await authenticateUser(prisma, initialContext.request),
    pubSub,
  };
}
