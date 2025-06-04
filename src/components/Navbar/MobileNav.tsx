"use client"
import React from 'react'
import SignInButton from '../Buttons/SignInButton'
import { useRouter } from 'next/navigation';
import Search from '../Search/Search';

const MobileNav = () => {
    const router = useRouter();
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-gray-100 shadow-md">
        <div className="text-lg font-bold" onClick={() => router.push('/')}>Aura Chat</div>
        <Search />
        <SignInButton />
    </div>
  )
}

export default MobileNav
