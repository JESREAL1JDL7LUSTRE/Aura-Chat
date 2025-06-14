"use client"
import React from 'react'
import SignInButton from '../Buttons/SignInButton'
import { useRouter } from 'next/navigation';
import Search from '../Search/Search';
import NotificationButton from '../Buttons/Notifications/NotificationButton';

const DesktopNav = () => {
    const router = useRouter();
  return (
    <div className="hidden md:flex items-center justify-between h-20 bg-gray-100 shadow-md">
        <div className="text-lg font-bold" onClick={() => router.push('/')} >Aura Chat</div>
        <Search />
        <NotificationButton />
        <SignInButton />
    </div>
  )
}

export default DesktopNav
