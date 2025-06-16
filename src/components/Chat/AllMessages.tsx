import React from 'react';
import Image from 'next/image';
import prisma from '@/lib/prisma'; // Adjust the import path as needed
import OnClickNav from '../Buttons/OnClickNav';

interface Friend {
  id: string;
  name: string | null;
  image: string | null;
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

interface AllMessagesProps {
  userId: string;
}

const AllMessages = async ({ userId }: AllMessagesProps) => {
  const friends = await getFriends(userId);

  return (
      <div>
        {friends.length > 0 ? (
          <div className="space-y-2">
            {friends.map((friend: Friend) => (
              <OnClickNav key={friend.id} path={`/aura-message/${friend.id}`}>
              <div className="flex items-center gap-3">
              <Image 
                src={friend.image || '/default-profile.png'} 
                alt={friend.name || 'Friend'} 
                className='w-10 h-10 rounded-full' 
                width={40} 
                height={40} 
              />
                <div>
                  <p className="font-medium text-gray-900">{friend.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">Click to chat</p>
                </div>
              </div>
              </OnClickNav>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm">No friends found</p>
          </div>
        )}
      </div>
  );
};

export default AllMessages;