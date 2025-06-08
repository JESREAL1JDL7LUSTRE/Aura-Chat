"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ProfileImage from '@/components/ProfileImage';
import useGetUserByID from '@/app/api/access/getUserByID';

const Profile = () => {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading } = useGetUserByID(id);

  if (isLoading) return 
  <div>
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div></div>;

  if (!user) return <div>
    <h1 className="text-2xl font-bold text-center mt-10">User Not Found</h1>
    <p className="text-center mt-4">The user you are looking for does not exist.</p>
  </div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-10">Profile Page</h1>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
        <ProfileImage width={100} height={100} src={user.image} />
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};

export default Profile;
