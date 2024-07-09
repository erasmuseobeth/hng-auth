import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';
import { User, ValidationError } from '@/lib/types';
import { validateUser } from '@/lib/validation';

export async function POST(request: Request) {
  const body: Partial<User> = await request.json();
  const { firstName, lastName, email, password, phone } = body;

  // Validate request body
  const errors = validateUser(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (existingUser) {
      return NextResponse.json({
        status: 'Bad request',
        message: 'Registration unsuccessful Email already exists',
        statusCode: 422,
      }, { status: 422 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password as string, 10);

    // Create user and default organisation in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: firstName as string,
          lastName: lastName as string,
          email: email as string,
          password: hashedPassword,
          phone: phone as string,
        },
      });

      // Create default organisation with the user as both creator and member
      const organisation = await prisma.organisation.create({
        data: {
          name: `${firstName}'s Organisation`,
          description: 'Default organisation',
          creator: { connect: { userId: user.userId } },
          members: {
            connect: { userId: user.userId },
          },
        },
      });
// return user and orgsnisation
      return { user, organisation };
    });

    const { user, organisation } = result;

    // Generate a JWT token
    const accessToken = generateToken(user.userId);

    return NextResponse.json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
        organisations: {
          orgId: organisation.orgId,
          name: organisation.name,
          description: organisation.description,
        },
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'Bad request',
      message: 'Registration unsuccessful',
      statusCode: 400,
    }, { status: 400 });
  }
}
