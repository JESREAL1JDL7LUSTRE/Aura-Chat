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

    // Verify user has access to conversation
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileMessages = await prisma.message.findMany({
      where: {
        conversationId: params.id,
        type: {
          in: ['IMAGE', 'FILE', 'VIDEO', 'AUDIO']
        },
        isDeleted: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        file: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(fileMessages);
  } catch (error) {
    console.error('Error fetching file messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
