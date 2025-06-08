'use client'

import React from 'react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useAddFrends from '@/app/api/access/addFrends';

const AddToFriendsList = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate: addFriend, isPending } = useAddFrends();

  const handleAddFriend = () => {
    if (!id) return;
    addFriend(id, {
      onSuccess: () => {
        console.log('Friend added successfully');
      },
      onError: (error) => {
        console.error('Failed to add friend:', error);
      },
    });
  };

  const isCurrentUser = session?.user?.id === id;

  return (
    <>
      {!isCurrentUser ? (
        <Button
          variant="ghost"
          className="w-full hover:bg-gray-200 mt-4"
          onClick={handleAddFriend}
          disabled={isPending}
        >
          <span className="text-sm">
            {isPending ? 'Adding...' : 'Add Friend'}
          </span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="w-full hover:bg-gray-200 mt-4"
          onClick={() => router.push(`/${id}`)}
        >
          <span className="text-sm">Visit Friend</span>
        </Button>
      )}
    </>
  );
};

export default AddToFriendsList;
