import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getFriends(id: string) {
    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const friendships = await prisma.friends.findMany({
            where: {
                OR: [
                    {
                        userId: id,
                        status: "ACCEPTED"
                    },
                    {
                        friendId: id,
                        status: "ACCEPTED"
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        username: true,
                        status: true,
                        lastSeen: true
                    }
                },
                friend: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        username: true,
                        status: true,
                        lastSeen: true
                    }
                }
            }
        });

        // Extract the friend user data (not the current user)
        const friends = friendships.map(friendship => {
            // If current user is the one who sent the friend request
            if (friendship.userId === id) {
                return friendship.friend;
            } else {
                // If current user is the one who received the friend request
                return friendship.user;
            }
        });

        return NextResponse.json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function getFriendsWithMetadata(id: string) {
    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const friendships = await prisma.friends.findMany({
            where: {
                OR: [
                    {
                        userId: id,
                        status: "ACCEPTED"
                    },
                    {
                        friendId: id,
                        status: "ACCEPTED"
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        username: true,
                        status: true,
                        lastSeen: true
                    }
                },
                friend: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        username: true,
                        status: true,
                        lastSeen: true
                    }
                }
            }
        });

        // Map to include both friend data and friendship metadata
        const friendsWithMetadata = friendships.map(friendship => {
            const friendData = friendship.userId === id ? friendship.friend : friendship.user;
            
            return {
                ...friendData,
                friendshipId: friendship.id,
                friendsSince: friendship.acceptedAt,
                createdAt: friendship.createdAt
            };
        });

        return NextResponse.json(friendsWithMetadata);
    } catch (error) {
        console.error('Error fetching friends:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function getPendingFriendRequests(id: string) {
    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const pendingRequests = await prisma.friends.findMany({
            where: {
                friendId: id, // User is the recipient
                status: "PENDING"
            },
            include: {
                user: { // The person who sent the request
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        username: true
                    }
                }
            }
        });

        const requests = pendingRequests.map(request => ({
            requestId: request.id,
            requester: request.user,
            createdAt: request.createdAt
        }));

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching pending friend requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function getSentFriendRequests(id: string) {
    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const sentRequests = await prisma.friends.findMany({
            where: {
                userId: id, // User is the sender
                status: "PENDING"
            },
            include: {
                friend: { // The person who received the request
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        username: true
                    }
                }
            }
        });

        const requests = sentRequests.map(request => ({
            requestId: request.id,
            recipient: request.friend,
            createdAt: request.createdAt
        }));

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching sent friend requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function addFriend(userId: string, friendId: string) {
  if (!userId || !friendId) {
    return NextResponse.json({ error: 'User ID and Friend ID are required' }, { status: 400 });
  }

  try {
    const existingRequest = await prisma.friends.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 409 });
    }

    const newFriendship = await prisma.friends.create({
      data: {
        userId,
        friendId,
        status: 'PENDING'
      }
    });

    return NextResponse.json(newFriendship, { status: 200 });
  } catch (error) {
    console.error('Error adding friend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}