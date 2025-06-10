import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { UserStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

// POST /api/status/online - Update user's online status
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !Object.values(UserStatus).includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status', 
          validStatuses: Object.values(UserStatus) 
        },
        { status: 400 }
      );
    }

    // Update user status in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        status: status as UserStatus,
        lastSeen: status === UserStatus.OFFLINE ? new Date() : null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        lastSeen: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Status updated to ${status}`,
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/status/online - Get current user's status (optional endpoint)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        status: true,
        lastSeen: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}