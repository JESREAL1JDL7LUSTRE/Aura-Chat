import { useEffect, useRef } from 'react';
import SocketManager from '@/lib/socket';
import { useSession } from 'next-auth/react';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (session?.user?.id && !socketRef.current) {
      const socketManager = SocketManager.getInstance();
      socketRef.current = socketManager.connect(session.user.id);
      
      // Authenticate with the server
      if (socketRef.current) {
        socketRef.current.emit('authenticate', { userId: session.user.id });
      }
    }

    return () => {
      if (socketRef.current) {
        SocketManager.getInstance().disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user?.id]);

  return socketRef.current;
};