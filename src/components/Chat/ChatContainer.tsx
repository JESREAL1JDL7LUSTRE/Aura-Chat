'use client';

import { ReactNode, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface ChatContainerProps {
  conversationId: string;
  children: ReactNode;
}

export default function ChatContainer({ conversationId, children }: ChatContainerProps) {
  const socket = useSocket();

  useEffect(() => {
    if (socket && conversationId) {
      // Join the conversation room
      socket.emit('join_conversation', conversationId);

      return () => {
        // Leave the conversation room when component unmounts
        socket.emit('leave_conversation', conversationId);
      };
    }
  }, [socket, conversationId]);

  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  );
}