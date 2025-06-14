'use client';

import { usePathname } from 'next/navigation';
import Friends from '@/components/Friends/Friends';

const FriendsWrapper = () => {
  const pathname = usePathname();
  
  const hiddenRoutes = ['/aura-message'];
  
  // Check if current route should hide Friends
  const shouldHideFriends = hiddenRoutes.some(route => pathname.startsWith(route));
  
  if (shouldHideFriends) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-md p-4 justify-end flex">
      <Friends />
    </div>
  );
};

export default FriendsWrapper;