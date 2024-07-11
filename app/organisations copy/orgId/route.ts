// app/api/organisations/[orgId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  // Authenticate the user
  const authenticatedUser = await authenticateUser(request);
  if (!authenticatedUser) {
    return NextResponse.json({
      status: 'error',
      message: 'Unauthorized',
    }, { status: 401 });
  }

  const { orgId } = params;

  try {
    // Find the organization
    const organization = await prisma.organisation.findUnique({
      where: { orgId },
      include: { members: true },
    });

    if (!organization) {
      return NextResponse.json({
        status: 'error',
        message: 'Organization not found',
      }, { status: 404 });
    }

    // Check if the authenticated user is a member or the creator of the organization
    const isMember = organization.members.some(member => member.userId === authenticatedUser.userId);
    const isCreator = organization.creatorId === authenticatedUser.userId;

    if (!isMember && !isCreator) {
      return NextResponse.json({
        status: 'error',
        message: 'Access denied',
      }, { status: 403 });
    }

    // Return the organization data
    return NextResponse.json({
      status: 'success',
      message: 'Organization retrieved successfully',
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
    }, { status: 500 });
  }
};
