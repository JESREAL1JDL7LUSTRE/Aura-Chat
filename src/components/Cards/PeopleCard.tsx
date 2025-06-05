import React from 'react'
import Image from 'next/image'
import { Button } from '../ui/button';

interface Props {
    img ?: string;
    name ?: string;
}

const PeopleCard = (props: Props) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg w-full max-w-xs text-center">
      <div className="flex justify-center mb-4">
        <Image
            src={props.img || '/Profiles/noProfiles.png'}
            className="rounded-full"
            alt={props.name || 'User Avatar'}
            height={100}
            width={100}
        />
        </div>
        <h2 className="text-lg font-semibold">{props.name || 'Sample Name'}</h2>
        <Button variant={'ghost'} className="mt-4 w-full flex items-center justify-center hover:bg-gray-200">
            <span className="text-sm">Add Friend</span>
        </Button>
    </div>
  )
}

export default PeopleCard
