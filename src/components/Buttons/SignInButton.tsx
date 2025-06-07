"use client";
import React from 'react'
import { Button } from '../ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';
import ProfileImage from '../ProfileImage';

const SignInButton = () => {
  const { data: session } = useSession()
  const router = useRouter();
  if (session && session.user) {
    return (
      <div className="flex items-center justify-center gap-3">
        <ProfileImage width={40} height={40} src={session.user.image ?? undefined} />
        <p className="text-black" onClick={() => {router.push(`/${session.user.id}`)}}>
          {session.user.name}</p>
        <Button
          className="bg-black text-white hover:bg-gray-700"
          onClick={() => {
            signOut({ callbackUrl: '/' })
          }}> Sign Out </Button>
      </div>
    )
  }

  return (
    <div>
      <Button
        className="bg-white text-black hover:bg-gray-700 hover:text-white"
        onClick={() => {
          signIn()}}
          > Sign In </Button>
    </div>
  )
}

export default SignInButton
