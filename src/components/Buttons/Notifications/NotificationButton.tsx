"use client";

import React from 'react'
import { Button } from '../../ui/button'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const NotificationButton = () => {
    const router = useRouter();
    const {data: user } = useSession()
  return ( 
    <Button variant={'ghost'} className='hover:bg-gray-300' onClick={() => router.push(`/notification/${user?.user?.id}`)}>
        <span className="text-sm">Aura Notify</span>
    </Button>
  )
}

export default NotificationButton
