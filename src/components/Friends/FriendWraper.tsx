import Friends from '@/components/Friends/Friends';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import HideComponent from '../HideComponent';

const FriendsWrapper = async () => {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user
  const userId = session?.user?.id

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-md p-4 justify-end flex">
      <HideComponent path={'/aura-message'}>
      <Friends userId={userId || ''} isAuthenticated={isAuthenticated}/>
      </HideComponent>
    </div>
  );
};

export default FriendsWrapper;