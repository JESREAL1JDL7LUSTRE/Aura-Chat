"use client";
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import AddToFriendsList from '../Buttons/AddToFriendsList';

interface User {
  id?: string;
  name?: string;
  img?: string;
}

const PeopleCard = (user: User) => {
  const router = useRouter();
  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full max-w-xs text-center">
      <div className="flex justify-center mb-4">
        <Image
            src={user.img || '/Profiles/noProfiles.png'}
            className="rounded-full hover:scale-105 transition-transform duration-300"
            alt={user.name || 'User Avatar'}
            height={100}
            width={100}
            onClick={() => {router.push(`/${user.id}`)}}/>
        </div>
        <h2 className="text-lg font-semibold">{user.name || 'Sample Name'}</h2>
        <AddToFriendsList id={user.id || ''}/>
    </div>
  )
}

export default PeopleCard
