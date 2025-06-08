import { NextRequest, NextResponse } from 'next/server';
import { addFriend, getFriends } from '@/app/api/method/friends/[id]/Friends';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // or wherever your auth config is

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body;

    // Call the function you defined
    return await addFriend(session.user.id, friendId);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await getFriends(id);
}
