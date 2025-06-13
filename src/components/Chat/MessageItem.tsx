'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Reply, Heart, ThumbsUp, Laugh, Angry } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReactionPicker from './ReactionPicker';


interface MessageItemProps {
  message: any;
  currentUserId: string;
  showAvatar: boolean;
  showTimestamp: boolean;
  isGroup: boolean;
  onReply?: (message: any) => void;
}

const REACTION_EMOJIS = {
  '❤️': Heart,
  '👍': ThumbsUp,
  '😂': Laugh,
  '😠': Angry,
};

export default function MessageItem({
  message,
  currentUserId,
  showAvatar,
  showTimestamp,
  isGroup,
  onReply
}: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false);
  const isOwnMessage = message.senderId === currentUserId;

  const handleReaction = async (emoji: string) => {
    try {
      await fetch(`/api/messages/${message.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const groupedReactions = message.reactions?.reduce((acc: any, reaction: any) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {}) || {};

  return (
    <div className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && isGroup && !isOwnMessage && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.sender.image || ''} />
          <AvatarFallback>
            {message.sender.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Spacer for alignment */}
      {!showAvatar && isGroup && !isOwnMessage && (
        <div className="w-8" />
      )}

      {/* Message content */}
      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'flex flex-col items-end' : ''}`}>
        {/* Sender name for group chats */}
        {showAvatar && isGroup && !isOwnMessage && (
          <div className="text-sm font-medium text-gray-700 mb-1">
            {message.sender.name}
          </div>
        )}

        {/* Reply indicator */}
        {message.parentMessage && (
          <div className="text-xs text-gray-500 mb-1 p-2 bg-gray-100 rounded border-l-4 border-blue-400">
            <div className="font-medium">{message.parentMessage.sender.name}</div>
            <div className="truncate">
              {message.parentMessage.content || '📎 File'}
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* File attachment */}
          {message.file && (
            <div className="mb-2">
              {message.file.type.startsWith('image/') ? (
                <Image
                  src={message.file.url}
                  alt={message.file.name}
                  className="max-w-full h-auto rounded cursor-pointer"
                  onClick={() => window.open(message.file.url, '_blank')}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white bg-opacity-10 rounded">
                  <div className="text-sm">
                    📎 {message.file.name}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message text */}
          {message.content && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Message actions */}
          {showReactions && (
            <div className={`absolute top-0 flex items-center gap-1 ${
              isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'
            }`}>
              <ReactionPicker onReact={handleReaction} />
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message)}
                  className="h-6 w-6 p-0"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      Reply
                    </DropdownMenuItem>
                  )}
                  {isOwnMessage && (
                    <DropdownMenuItem className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(groupedReactions).map(([emoji, reactions]: [string, any]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${
                  reactions.some((r: any) => r.userId === currentUserId)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{emoji}</span>
                <span>{reactions.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <div className={`text-xs text-gray-500 mt-1 ${
            isOwnMessage ? 'text-right' : 'text-left'
          }`}>
            {format(new Date(message.createdAt), 'HH:mm')}
          </div>
        )}
      </div>
    </div>
  );
}