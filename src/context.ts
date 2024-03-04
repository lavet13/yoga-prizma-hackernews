import { YogaInitialContext } from 'graphql-yoga';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from './auth';
import { pubSub } from './pubsub';
import jwt from 'jsonwebtoken';
// import { inspect } from './utils/debug/inspect';

export type ContextValue = {
  prisma: PrismaClient;
  me: jwt.JwtPayload | null;
  pubSub: typeof pubSub;
};

const prisma = new PrismaClient();

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<ContextValue> {
  return {
    prisma,
    me: authenticateUser(initialContext.request),
    pubSub,
  };
}
