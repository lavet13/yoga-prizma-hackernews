import jwt from 'jsonwebtoken';

export function authenticateUser(
  request: Request,
): jwt.JwtPayload | null {
  const header = request.headers.get('authorization');

  if (header === null) return null;

  const token = header.split(' ')[1];

  return jwt.verify(token, APP_SECRET) as jwt.JwtPayload;
}

export const APP_SECRET = 'B49CdDLDpz4DdptfA9wzk8GIE9Lg278tzTN48jhacpc=';
