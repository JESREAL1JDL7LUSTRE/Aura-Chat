import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Handle GET requests to fetch friends list
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch accepted friends for the current user
    const friends = await prisma.friends.findMany({
      where: {
        userId: userId,
        status: 'ACCEPTED'
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ friends });

  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Handle POST requests to send friend requests
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body;
    const userId = session.user.id;

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      );
    }

    if (friendId === userId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friends.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existingFriendship) {
      // Handle different existing friendship scenarios
      if (existingFriendship.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'You are already friends' },
          { status: 409 }
        );
      }
      
      if (existingFriendship.status === 'PENDING') {
        // If current user is the sender, don't allow duplicate
        if (existingFriendship.userId === userId) {
          return NextResponse.json(
            { error: 'Friend request already sent' },
            { status: 409 }
          );
        }
        
        // If current user is the receiver and wants to send back, auto-accept the friendship
        if (existingFriendship.friendId === userId) {
          const acceptedFriendship = await prisma.friends.update({
            where: { id: existingFriendship.id },
            data: {
              status: 'ACCEPTED',
              acceptedAt: new Date(),
              updatedAt: new Date()
            }
          });

          return NextResponse.json({ 
            message: 'Friend request accepted! You are now friends.',
            friendRequest: acceptedFriendship,
            autoAccepted: true
          });
        }
      }
      
      if (existingFriendship.status === 'BLOCKED') {
        return NextResponse.json(
          { error: 'Cannot send friend request to blocked user' },
          { status: 403 }
        );
      }
      
      // If status is DECLINED, allow resending by updating the existing record
      if (existingFriendship.status === 'DECLINED') {
        const updatedFriendRequest = await prisma.friends.update({
          where: { id: existingFriendship.id },
          data: {
            status: 'PENDING',
            userId: userId, // Ensure current user is the sender
            friendId: friendId,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({ 
          message: 'Friend request sent',
          friendRequest: updatedFriendRequest 
        });
      }
    }

    // Create new friend request if no existing friendship found
    const friendRequest = await prisma.friends.create({
      data: {
        userId: userId,
        friendId: friendId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      message: 'Friend request sent',
      friendRequest 
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}