// lib/jwt.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TokenPayload {
  userId: string;
  exp: number; // Expiration time in seconds since Unix epoch
}

export function generateToken(userId: string): string {
  const expiresIn = '1h'; // Token expires in 1 hour
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expires in 1 hour from now
  };
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
