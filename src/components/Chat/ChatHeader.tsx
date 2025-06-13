import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Video, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  otherUser: any;
}

export default function ChatHeader({ otherUser }: ChatHeaderProps) {
  const getStatusText = () => {
    if (otherUser.status === 'ONLINE') {
      return 'Online';
    }
    if (otherUser.lastSeen) {
      return `Last seen ${formatDistanceToNow(new Date(otherUser.lastSeen), { addSuffix: true })}`;
    }
    return 'Offline';
  };

  const getStatusColor = () => {
    switch (otherUser.status) {
      case 'ONLINE': return 'bg-green-500';
      case 'AWAY': return 'bg-yellow-500';
      case 'BUSY': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Image
            src={otherUser.image || '/default-avatar.png'}
            alt={otherUser.name || otherUser.username || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {otherUser.name || otherUser.username}
          </h3>
          <p className="text-sm text-gray-500">{getStatusText()}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}