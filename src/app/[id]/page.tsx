"use client"
import React from 'react'
import ProfileImage from '@/components/ProfileImage';

interface Props {
  id ?: string;
  status ?: 'loading' | 'authenticated' | 'unauthenticated';
  name ?: string;
  email ?: string;
}

const Profile = (props: Props) => {
  if (props.status === 'loading') {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-10">Profile Page</h1>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
        <ProfileImage width={100} height={100}/>
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p><strong>Name:</strong> {props.name || "Not available"}</p>
        <p><strong>Email:</strong> {props?.email || "Not available"} </p>
        </div>
    </div>
  )
}

export default Profile
