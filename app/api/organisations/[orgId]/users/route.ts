// app/api/organisations/[orgId]/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { orgId: string } }) {
  // Authenticate the user
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized',
    }, { status: 401 });
  }

  const { orgId } = params;
  const body = await request.json();
  const { userId } = body;

  // Validate the request body
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({
      status: 'Bad Request',
      message: 'Client error',
      statusCode: 400,
    }, { status: 400 });
  }

  try {
    // Check if the organization exists and the authenticated user is the creator
    const organisation = await prisma.organisation.findUnique({
      where: { orgId },
    });

    if (!organisation) {
      return NextResponse.json({
        status: 'error',
        message: 'Organization not found',
      }, { status: 404 });
    }

    if (organisation.creatorId !== authenticatedUser.userId) {
      return NextResponse.json({
        status: 'error',
        message: 'Access denied',
      }, { status: 403 });
    }

    // Add the user to the organization
    await prisma.organisation.update({
      where: { orgId },
      data: {
        members: {
          connect: { userId },
        },
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'User added to organisation successfully',
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
    }, { status: 500 });
  }
}
