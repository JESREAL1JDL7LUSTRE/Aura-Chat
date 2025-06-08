import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import PeopleCard from '../Cards/PeopleCard';
import { authOptions } from '@/lib/auth';

const AddFriend = async () => {
  const session = await getServerSession(authOptions);

  const currentUserId = session?.user?.id;

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId || '',
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-600">No users found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {users.map((user) => (
        <PeopleCard
          key={user.id}
          id={user.id}
          name={user.name ?? 'Unknown'}
          img={user.image ?? undefined}
        />
      ))}
    </div>
  );
};

export default AddFriend;
