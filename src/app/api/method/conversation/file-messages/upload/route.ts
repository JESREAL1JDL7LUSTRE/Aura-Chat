import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;

    if (!file || !conversationId) {
      return NextResponse.json({ error: 'Missing file or conversationId' }, { status: 400 });
    }

    // Verify user is participant
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: session.user.id
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upload file to storage (using Vercel Blob as example)
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Create file record
    const fileRecord = await prisma.file.create({
      data: {
        filename: blob.pathname,
        originalName: file.name,
        mimetype: file.type,
        url: blob.url,
        size: file.size,
        uploadedById: session.user.id
      }
    });

    return NextResponse.json(fileRecord);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}