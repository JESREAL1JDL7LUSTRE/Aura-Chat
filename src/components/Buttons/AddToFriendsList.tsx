import React from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation';

const AddToFriendsList = ({ id }: { id: string }) => {
    const router = useRouter();
  return (
    <>
    if (id) {
    <Button variant={"ghost"} className="w-full hover:bg-gray-200 mt-4">
        <span className="text-sm">Add Friend</span>
    </Button>
} else {
    <Button variant={"ghost"} className="w-full hover:bg-gray-200 mt-4" onClick={() => {router.push(`/${id}`)}}>
        <span className="text-sm">Visit Friend</span>
    </Button>
}
    </>
  )
}

export default AddToFriendsList
