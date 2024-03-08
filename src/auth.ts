import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

export function authenticateUser(request: Request): jwt.JwtPayload | null {
  const header = request.headers.get('authorization');

  if (!header) return null;

  const [, token] = header.split(' ');

  if(!token) {
    throw new GraphQLError('Forget to put Bearer at the beginning');
  }

  try {
    return jwt.verify(token, import.meta.env.VITE_SECRET) as jwt.JwtPayload;
  } catch(err: unknown) {
    throw new GraphQLError('Session timeout. Please authenticate again.');
  }
}
