import React from 'react'
import Image from 'next/image'
import Link from "next/link"
import OnClickNav from "../Buttons/OnClickNav"
import prisma from '@/lib/prisma'

type Friend = {
  id: string;
  name: string | null;
  image: string | null;
  status?: string; // Optional status field
}

// Server function to get friends
async function getFriends(userId: string): Promise<Friend[]> {
  try {
    // Get all accepted friendships where the user is either the sender or receiver
    const friendships = await prisma.friends.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        friend: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // Extract the friend data (the other person in the friendship)
    const friends = friendships.map(friendship => {
      // If current user is the one who sent the friend request, return the friend
      if (friendship.userId === userId) {
        return friendship.friend;
      }
      // If current user is the one who received the friend request, return the user
      return friendship.user;
    });

    return friends;
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

interface FriendsProps {
  userId: string;
  isAuthenticated?: boolean; // Add this prop to handle authentication status
}

const Friends = async ({ userId, isAuthenticated = false }: FriendsProps) => {
  // If user is not authenticated, show sign-in message
  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
        <div className='p-4 bg-white shadow-md rounded-lg w-full max-w-xs'>
          <div>
            <p className='text-gray-500 text-sm'>
              <Link href={"/api/auth/signin"} className="text-blue-500 underline">
                Sign In
              </Link> to see friends
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get friends data
  const friends = await getFriends(userId);

  // If no friends found
  if (!friends || friends.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
        <div className='p-4 bg-white shadow-md rounded-lg w-full max-w-xs'>
          <p className='text-gray-500 text-sm'>No friends found, Lonely ahh</p>
        </div>
      </div>
    );
  }

  // Render friends list
return (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
    <div className='p-1 bg-white shadow-md rounded-lg w-full max-w-xs max-h-80 overflow-y-auto'>
      {friends.length > 0 ? (
        friends.map((friend: Friend) => (
          <OnClickNav key={friend.id} path={`/aura-message/${friend.id}`}>
            <div className='flex items-center gap-3 mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'>
              <Image
                src={friend.image || '/default-profile.png'}
                alt={`${friend.name || 'Friend'}'s profile picture`}
                className='w-10 h-10 rounded-full object-cover'
                width={40}
                height={40}
              />
              <div className="flex-1 min-w-0">
                <p className='font-semibold text-gray-900 truncate'>
                  {friend.name || 'Unknown User'}
                </p>
                <p className='text-sm text-gray-500 truncate'>
                  {friend.status || 'No status'}
                </p>
              </div>
            </div>
          </OnClickNav>
        ))
      ) : (
        <div className="text-center py-4">
          <p className='text-gray-500 text-sm'>No friends yet</p>
          <p className='text-gray-400 text-xs mt-1'>Add some friends to get started!</p>
        </div>
      )}
    </div>
  </div>
)
}

export default Friends