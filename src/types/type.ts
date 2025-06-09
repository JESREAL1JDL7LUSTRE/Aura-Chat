// Updated interface to match your database schema
export interface NotificationData {
  id: string;
  type: 'SENT_FRIEND_REQUEST' | 'FRIEND_REQUEST_ACCEPTED' | 'NEW_MESSAGE' | 'MENTION' | 'GROUP_INVITE' | 'CALL' | 'READ_RECEIPT';
  title: string | null;
  content: string | null;
  isRead: boolean;
  createdAt: Date;
  userId: string;
  senderId: string | null;
  messageId: string | null;
  conversationId: string | null;
  sender: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  } | null;
  message: {
    id: string;
    content: string | null;
  } | null;
  conversation: {
    id: string;
    name: string | null;
    isGroup: boolean;
  } | null;
}
