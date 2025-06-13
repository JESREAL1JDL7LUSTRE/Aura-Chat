import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        participants: {
          some: { userId: session.user.id }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                status: true,
                lastSeen: true
              }
            }
          }
        },
        groupDetails: true,
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            },
            file: true,
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true
                  }
                }
              }
            },
            parentMessage: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, isArchived, isPinned } = body;

    // Check if user is participant
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: params.id },
      data: {
        name,
        isArchived,
        isPinned,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}