import React from 'react'
import AllMessages from '../Chat/AllMessages';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const AllMessagesWrapper = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div>
      </div>
    );
  }

  return <AllMessages userId={session.user.id} />;
};

export default AllMessagesWrapper
