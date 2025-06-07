import React from 'react'
import Image from 'next/image'

interface Props {
    width?: number;
    height?: number;
    src?: string;
}

const ProfileImage = (props: Props) => {
  return (
    <div>
      <Image
        src={props.src || '/default-profile.png'}
        alt="Profile Image"
        width={props.width || 50}
        height={props.height || 50}
        className="rounded-full border-2 border-gray-300 shadow-sm" />
    </div>
  )
}

export default ProfileImage
