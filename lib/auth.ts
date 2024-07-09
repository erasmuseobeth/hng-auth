// lib/auth.ts
import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import prisma from './prisma';

export async function authenticateUser(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization) return null;

  const token = authorization.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}
