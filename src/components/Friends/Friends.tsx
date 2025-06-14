"use client"
import useGetUserByID from "@/app/api/access/getUserByID"
import { useSession } from "next-auth/react"
import React from 'react'
import Image from 'next/image'
import FriendsList from "@/app/api/access/getFriends"
import Link from "next/link"
import { useRouter } from "next/navigation";

type Friend = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  status: string;
  lastSeen: Date | null;
}

const Friends = () => {
  const {data: session, status } = useSession()
  const { data: user, isLoading: userLoading } = useGetUserByID(session?.user?.id || '')
  const { data: friendsData, isLoading: friendsLoading, error } = FriendsList(user?.id || '');
  const router = useRouter();
  if (userLoading || (friendsLoading && user?.id)) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (status !== "authenticated") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
        <div className='p-4 bg-white shadow-md rounded-lg w-full max-w-xs'>
          <div>
            <p className='text-gray-500 text-sm'><Link href={"/api/auth/signin"} className="text-blue-500 underline">Sign In</Link> to see friends</p>
          </div>
        </div>
      </div>
    );
  }

  const friends = friendsData || [];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-md p-4 justify-end flex">
      <div className='p-4 bg-white shadow-md rounded-lg w-full max-w-xs'>
        {error && (
          <p className='text-red-500 text-sm mb-2'>Error loading friends: {error.message}</p>
        )}
        {friends.length > 0 ? (
          friends.map((friend: Friend) => (
            <div key={friend.id} className='flex items-center gap-3 mb-2'>
              <Image 
                src={friend.image || '/default-profile.png'} 
                alt={friend.name || 'Friend'} 
                className='w-10 h-10 rounded-full' 
                width={40} 
                height={40} 
                onClick={() => router.push(`/aura-message/${friend.id}`)}
              />
              <div>
                <p className='font-semibold'>{friend.name}</p>
                <p className='text-sm text-gray-500'>{friend.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div>
            <p className='text-gray-500 text-sm'>No friends found, Lonely ahh</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Friends