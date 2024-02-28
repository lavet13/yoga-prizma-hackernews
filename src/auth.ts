import jwt from 'jsonwebtoken';
import { type JwtPayload } from 'jsonwebtoken';
import { type PrismaClient, type User } from '@prisma/client';
import util from 'node:util';
export const APP_SECRET = 'B49CdDLDpz4DdptfA9wzk8GIE9Lg278tzTN48jhacpc=';

export async function authenticateUser(prisma: PrismaClient, request: Request): Promise<User | null> {
  const header = request.headers.get('authorization');

  if(header === null) return null;

  console.log(util.inspect(header, { colors: true, depth: null }));
  const token = header.split(' ')[1];

  const tokenPayload = jwt.verify(token, APP_SECRET) as JwtPayload;

  const userId = tokenPayload.userId;

  return await prisma.user.findUnique({ where: { id: userId } });
}
