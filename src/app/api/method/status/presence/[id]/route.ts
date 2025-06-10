import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust path as needed
import { UserStatus, FriendshipStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

// GET /api/status/presence/[userId] - Get specific user's presence/status
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the requesting user has permission to see this user's presence
    // This could be based on friendship status or conversation membership
    const canViewPresence = await checkPresencePermission(session.user.id, userId);

    if (!canViewPresence) {
      return NextResponse.json(
        { error: 'Not authorized to view this user\'s presence' },
        { status: 403 }
      );
    }

    // Get user's presence information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        status: true,
        lastSeen: true,
        isActive: true,
        updatedAt: true,
        settings: {
          select: {
            onlineStatus: true, // Whether user allows others to see their online status
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Define the complete presence data type
    interface PresenceData {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
      isActive: boolean;
      status: UserStatus;
      lastSeen: Date | null;
      isOnline: boolean;
      isAway: boolean;
      isBusy: boolean;
      isOffline: boolean;
      isInvisible: boolean;
    }

    // Define typing indicator type for better type safety
    interface TypingIndicatorData {
      conversationId: string;
      createdAt: Date;
      expiresAt: Date;
    }

    // Respect user's privacy settings and build presence data
    const presenceData: PresenceData = {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      isActive: user.isActive,
      // Default status info (will be overridden based on privacy settings)
      status: UserStatus.OFFLINE,
      lastSeen: null,
      isOnline: false,
      isAway: false,
      isBusy: false,
      isOffline: true,
      isInvisible: false,
    };

    // Only include real status information if user allows it
    if (user.settings?.onlineStatus !== false) {
      presenceData.status = user.status;
      presenceData.lastSeen = user.lastSeen;
      presenceData.isOnline = user.status === UserStatus.ONLINE;
      presenceData.isAway = user.status === UserStatus.AWAY;
      presenceData.isBusy = user.status === UserStatus.BUSY;
      presenceData.isOffline = user.status === UserStatus.OFFLINE;
      presenceData.isInvisible = user.status === UserStatus.INVISIBLE;
    }
    // If user has disabled status sharing, the default offline values are already set

    // Check if user is currently typing in any shared conversations
    const typingIndicators: TypingIndicatorData[] = await prisma.typingIndicator.findMany({
      where: {
        userId: userId,
        expiresAt: {
          gt: new Date(),
        },
        conversation: {
          participants: {
            some: {
              userId: session.user.id,
            }
          }
        }
      },
      select: {
        conversationId: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      presence: {
        ...presenceData,
        typingIn: typingIndicators.map((t: TypingIndicatorData) => t.conversationId),
        lastActivity: user.lastSeen || user.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error fetching user presence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check if user has permission to view another user's presence
async function checkPresencePermission(requesterId: string, targetUserId: string): Promise<boolean> {
  // If requesting own presence, always allow
  if (requesterId === targetUserId) {
    return true;
  }

  try {
    // Check if users are friends
    const friendship = await prisma.friends.findFirst({
      where: {
        OR: [
          {
            userId: requesterId,
            friendId: targetUserId,
            status: FriendshipStatus.ACCEPTED,
          },
          {
            userId: targetUserId,
            friendId: requesterId,
            status: FriendshipStatus.ACCEPTED,
          }
        ]
      }
    });

    if (friendship) {
      return true;
    }

    // Check if users share any conversations
    const sharedConversations = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            OR: [
              { userId: requesterId },
              { userId: targetUserId }
            ]
          }
        }
      }
    });

    if (sharedConversations) {
      return true;
    }

    // If no friendship or shared conversations, deny access
    return false;

  } catch (error) {
    console.error('Error checking presence permission:', error);
    return false;
  }
}

// PUT /api/status/presence/[userId] - Update another user's status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This endpoint could be used by admins to manage user status
    // For now, we'll restrict it to the user themselves
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Can only update your own status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(UserStatus).includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status', 
          validStatuses: Object.values(UserStatus) 
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        status: status as UserStatus,
        lastSeen: status === UserStatus.OFFLINE ? new Date() : null,
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
    });

  } catch (error) {
    console.error('Error updating user presence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}