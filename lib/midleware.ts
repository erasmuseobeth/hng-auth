// lib/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const verifyToken = (req: NextRequest) => {
  const token = req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return { valid: false, error: 'Token missing' };
  }

  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: 'Invalid token' };
  }
};
