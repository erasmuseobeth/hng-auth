// app/api/organisations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { validateOrganisation } from '@/lib/validation';


export async function GET(request: NextRequest) {
  // Authenticate the user
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized',
    }, { status: 401 });
  }

  try {
    // Find organizations where the authenticated user is a member or creator
    const organizations = await prisma.organisation.findMany({
      where: {
        OR: [
          { creatorId: authenticatedUser.userId },
          { members: { some: { userId: authenticatedUser.userId } } }
        ]
      },
      select: {
        orgId: true,
        name: true,
        description: true,
      },
    });

    // Return organizations data
    return NextResponse.json({
      status: 'success',
      message: 'Organizations retrieved successfully',
      data: {
        organizations,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
    }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  // Authenticate the user
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized',
    }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  // Validate the request body
  const errors = validateOrganisation(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    // Create the organization
    const organisation = await prisma.organisation.create({
      data: {
        name,
        description,
        creator: {
          connect: { userId: authenticatedUser.userId }
        },
        members: {
          connect: { userId: authenticatedUser.userId }
        }
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
    }, { status: 500 });
  }
}
