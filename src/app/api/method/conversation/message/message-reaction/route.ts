import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, emoji } = body;

    // Verify message exists and user has access
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: { userId: session.user.id }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji
      }
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id }
      });
      return NextResponse.json({ action: 'removed' });
    } else {
      // Add reaction
      const reaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      });
      return NextResponse.json({ action: 'added', reaction });
    }
  } catch (error) {
    console.error('Error handling message reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
