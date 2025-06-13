import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is participant
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const expiresAt = new Date(Date.now() + 3000); // 3 seconds

    const typingIndicator = await prisma.typingIndicator.upsert({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId: params.id
        }
      },
      update: { expiresAt },
      create: {
        userId: session.user.id,
        conversationId: params.id,
        expiresAt
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

    return NextResponse.json(typingIndicator);
  } catch (error) {
    console.error('Error handling typing indicator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.typingIndicator.deleteMany({
      where: {
        userId: session.user.id,
        conversationId: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing typing indicator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}