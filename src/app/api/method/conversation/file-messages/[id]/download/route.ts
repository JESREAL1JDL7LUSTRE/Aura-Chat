import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }

    // Get the file and verify user has access
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        message: {
          conversationId: params.id,
          conversation: {
            participants: {
              some: { userId: session.user.id }
            }
          }
        }
      },
      include: {
        message: {
          include: {
            conversation: {
              include: {
                participants: {
                  where: { userId: session.user.id }
                }
              }
            }
          }
        }
      }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
    }

    // For public files or if file is marked as public
    if (file.isPublic) {
      return NextResponse.redirect(file.url);
    }

    // Fetch the file from storage and stream it
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error('Failed to fetch file from storage');
      }

      const fileBuffer = await response.arrayBuffer();
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': file.mimetype,
          'Content-Disposition': `attachment; filename="${file.originalName || file.filename}"`,
          'Content-Length': file.size.toString(),
          'Cache-Control': 'private, no-cache',
        }
      });
    } catch (error) {
      console.error('Error streaming file:', error);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in file download:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}