
import React from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

interface Props {
    width?: number;
    height?: number;
}

const ProfileImage = (props: Props) => {
    const { data: Session } = useSession()

  return (
    <div>
      <Image
        src={Session?.user?.image || '/default-profile.png'}
        alt="Profile Image"
        width={props.width || 50}
        height={props.height || 50}
        className="rounded-full border-2 border-gray-300 shadow-sm" />
    </div>
  )
}

export default ProfileImage
