'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  conversationId: string;
  initialMessages: any[];
  currentUserId: string;
  isGroup?: boolean;
}

export default function MessageList({ 
  conversationId, 
  initialMessages, 
  currentUserId,
  isGroup = false 
}: MessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const socket = useSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const oldestMessage = messages[0];
      const cursor = oldestMessage?.createdAt;
      
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?cursor=${cursor}&limit=20`
      );
      
      if (response.ok) {
        const olderMessages = await response.json();
        if (olderMessages.length < 20) {
          setHasMore(false);
        }
        setMessages(prev => [...olderMessages.reverse(), ...prev]);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, messages, loading, hasMore]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleMessageUpdated = (updatedMessage: any) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    };

    const handleReactionUpdated = (data: any) => {
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === data.messageId) {
            if (data.action === 'added') {
              return {
                ...msg,
                reactions: [...(msg.reactions || []), data.reaction]
              };
            } else {
              return {
                ...msg,
                reactions: msg.reactions?.filter(
                  (r: any) => !(r.userId === data.reaction.userId && r.emoji === data.reaction.emoji)
                ) || []
              };
            }
          }
          return msg;
        })
      );
    };

    const handleUserTyping = (data: any) => {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.id === data.user.id);
        if (!existing) {
          return [...prev, data.user];
        }
        return prev;
      });
    };

    const handleUserStopTyping = (data: any) => {
      setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
    };

    // Join conversation room
    socket.emit('join_conversation', { conversationId });

    socket.on('message_received', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('reaction_updated', handleReactionUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('message_received', handleNewMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('reaction_updated', handleReactionUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.emit('leave_conversation', { conversationId });
    };
  }, [socket, scrollToBottom, conversationId]);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > initialMessages.length) {
      scrollToBottom();
    }
  }, [messages.length, initialMessages.length, scrollToBottom]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full px-4">
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={loadMoreMessages}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more messages'}
            </button>
          </div>
        )}
        
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const nextMessage = messages[index + 1];
            
            // Show avatar if this is the first message from this user in a group
            // or if it's been more than 5 minutes since their last message
            const showAvatar = isGroup && (
              !prevMessage || 
              prevMessage.senderId !== message.senderId ||
              new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000
            );

            // Show timestamp if this is the last message from this user
            // or if it's been more than 5 minutes until their next message
            const showTimestamp = !nextMessage ||
              nextMessage.senderId !== message.senderId ||
              new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 5 * 60 * 1000;

            return (
              <MessageItem
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                showAvatar={showAvatar}
                showTimestamp={showTimestamp}
                isGroup={isGroup}
              />
            );
          })}
        </div>

        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
        
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}