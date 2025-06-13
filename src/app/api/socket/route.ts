import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import prisma from '@/lib/prisma';

let io: SocketIOServer;

export async function GET() {
  if (!io) {
    // @ts-ignore
    const httpServer: HTTPServer = (global as any).httpServer;
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (data: { userId: string }) => {
        socket.data.userId = data.userId;
        
        // Update user status to online
        await prisma.user.update({
          where: { id: data.userId },
          data: { 
            status: 'ONLINE',
            lastSeen: new Date()
          }
        });

        // Join user to their conversation rooms
        const conversations = await prisma.participant.findMany({
          where: { userId: data.userId },
          select: { conversationId: true }
        });

        conversations.forEach(conv => {
          socket.join(`conversation_${conv.conversationId}`);
        });

        // Notify friends that user is online
        socket.broadcast.emit('user_status_change', {
          userId: data.userId,
          status: 'ONLINE'
        });
      });

      // Handle joining conversation rooms
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation_${conversationId}`);
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation_${conversationId}`);
      });

      // Handle new messages
      socket.on('new_message', (data: {
        conversationId: string;
        message: any;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('message_received', data.message);
      });

      // Handle message reactions
      socket.on('message_reaction', (data: {
        conversationId: string;
        messageId: string;
        reaction: any;
        action: 'added' | 'removed';
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('reaction_updated', data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: {
        conversationId: string;
        user: any;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', data);
      });

      socket.on('typing_stop', (data: {
        conversationId: string;
        userId: string;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', data);
      });

      // Handle message updates (edit, delete, pin)
      socket.on('message_updated', (data: {
        conversationId: string;
        message: any;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('message_updated', data.message);
      });

      // Handle read receipts
      socket.on('message_read', (data: {
        conversationId: string;
        messageId: string;
        userId: string;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('message_read', data);
      });

      // Handle group participant changes
      socket.on('participant_added', (data: {
        conversationId: string;
        participants: any[];
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('participants_updated', data);
        
        // Add new participants to the room
        data.participants.forEach(participant => {
          const participantSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.data.userId === participant.userId);
          if (participantSocket) {
            participantSocket.join(`conversation_${data.conversationId}`);
          }
        });
      });

      socket.on('participant_removed', (data: {
        conversationId: string;
        userId: string;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('participant_removed', data);
        
        // Remove user from the room
        const userSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.userId === data.userId);
        if (userSocket) {
          userSocket.leave(`conversation_${data.conversationId}`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        
        if (socket.data.userId) {
          // Update user status to offline
          await prisma.user.update({
            where: { id: socket.data.userId },
            data: { 
              status: 'OFFLINE',
              lastSeen: new Date()
            }
          });

          // Clean up expired typing indicators
          await prisma.typingIndicator.deleteMany({
            where: {
              userId: socket.data.userId,
              expiresAt: { lt: new Date() }
            }
          });

          // Notify friends that user is offline
          socket.broadcast.emit('user_status_change', {
            userId: socket.data.userId,
            status: 'OFFLINE',
            lastSeen: new Date()
          });
        }
      });

      // Handle file sharing notifications
      socket.on('file_shared', (data: {
        conversationId: string;
        message: any;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('file_received', data.message);
      });

      // Handle conversation updates (archive, pin, etc.)
      socket.on('conversation_updated', (data: {
        conversationId: string;
        updates: any;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('conversation_updated', data);
      });

      // Handle voice note events
      socket.on('voice_note_start', (data: {
        conversationId: string;
        userId: string;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('voice_recording_started', data);
      });

      socket.on('voice_note_stop', (data: {
        conversationId: string;
        userId: string;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('voice_recording_stopped', data);
      });

      // Handle user activity (last seen updates)
      socket.on('user_activity', async (data: { userId: string }) => {
        await prisma.user.update({
          where: { id: data.userId },
          data: { lastSeen: new Date() }
        });
      });

      // Handle group info updates
      socket.on('group_info_updated', (data: {
        conversationId: string;
        groupInfo: any;
      }) => {
        socket.to(`conversation_${data.conversationId}`).emit('group_info_updated', data);
      });

      // Handle notification events
      socket.on('notification_sent', (data: {
        userId: string;
        notification: any;
      }) => {
        // Send notification to specific user
        const userSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.userId === data.userId);
        if (userSocket) {
          userSocket.emit('new_notification', data.notification);
        }
      });

      // Periodic cleanup of expired typing indicators
      setInterval(async () => {
        await prisma.typingIndicator.deleteMany({
          where: { expiresAt: { lt: new Date() } }
        });
      }, 5000); // Clean up every 5 seconds
    });

    // Global error handling
    io.on('error', (error) => {
      console.error('Socket.IO server error:', error);
    });
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}
