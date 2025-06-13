import Image from 'next/image';
import { Phone, Video, MoreHorizontal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupChatHeaderProps {
  conversation: any;
  groupDetails: any;
  participants: any[];
  currentUserId: string;
  isAdmin: boolean;
}

export default function GroupChatHeader({ 
  groupDetails, 
  participants, 
  isAdmin 
}: GroupChatHeaderProps) {
  const onlineCount = participants.filter(p => p.user.status === 'ONLINE').length;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Image
            src={groupDetails.avatar || '/default-group-avatar.png'}
            alt={groupDetails.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>{groupDetails.name}</span>
            {isAdmin && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Admin
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{participants.length} members</span>
            {onlineCount > 0 && (
              <>
                <span>•</span>
                <span>{onlineCount} online</span>
              </>
            )}
          </p>
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