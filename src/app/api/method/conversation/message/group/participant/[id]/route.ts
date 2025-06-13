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

    const body = await request.json();
    const { userIds } = body;

    // Verify user is admin
    const adminParticipant = await prisma.participant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id,
        isAdmin: true
      }
    });

    if (!adminParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add participants
    const newParticipants = await Promise.all(
      userIds.map((userId: string) =>
        prisma.participant.upsert({
          where: {
            userId_conversationId: {
              userId,
              conversationId: params.id
            }
          },
          update: { leftAt: null },
          create: {
            userId,
            conversationId: params.id
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        })
      )
    );

    return NextResponse.json(newParticipants);
  } catch (error) {
    console.error('Error adding participants:', error);
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Verify user is admin or removing themselves
    const adminParticipant = await prisma.participant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id,
        isAdmin: true
      }
    });

    if (!adminParticipant && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.participant.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId: params.id
        }
      },
      data: { leftAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}