// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { validateLogin } from '@/lib/validation';
import { generateToken } from '@/lib/jwt';
import { LoginRequest } from '@/lib/types';

export async function POST(request: Request) {
  const body: Partial<LoginRequest> = await request.json();
  const { email, password } = body;

  // Validate request body
  const errors = validateLogin(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email as string },
      include: {
        organizations: true, // Include the organizations the user belongs to
        createdOrganizations: true, // Include the organizations the user created
      },
    });

    if (!user) {
      return NextResponse.json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      }, { status: 401 });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password as string, user.password);
    if (!passwordMatch) {
      return NextResponse.json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      }, { status: 401 });
    }

    // Generate a JWT token
    const accessToken = generateToken(user.userId);

    // Get the organizations the user belongs to or created
    const organizations = [...user.organizations, ...user.createdOrganizations];

    return NextResponse.json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          organizations: organizations.map(org => ({
            orgId: org.orgId,
            name: org.name,
            description: org.description,
          })),
        },
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
    }, { status: 500 });
  }
}
