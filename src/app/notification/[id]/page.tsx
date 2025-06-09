import Image from 'next/image';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { Bell, User, MessageCircle, UserPlus, Check } from 'lucide-react';
import AcceptOrDecline from '@/components/Buttons/Notifications/AcceptOrDecline';
import MarkAllRead from '@/components/Buttons/Notifications/MarkAllRead';


interface NotificationPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificationPage({ params }: NotificationPageProps) {

  const { id } = await params;

  // Fetch notifications for the user
  const notifications = await prisma.notification.findMany({
    where: {
      userId: id,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        }
      },
      message: {
        select: {
          id: true,
          content: true,
        }
      },
      conversation: {
        select: {
          id: true,
          name: true,
          isGroup: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'SENT_FRIEND_REQUEST':
      return <UserPlus className="w-5 h-5 text-blue-500" />;
    case 'FRIEND_REQUEST_ACCEPTED':
      return <Check className="w-5 h-5 text-green-500" />;
    case 'NEW_MESSAGE':
      return <MessageCircle className="w-5 h-5 text-purple-500" />;
    case 'MENTION':
      return <Bell className="w-5 h-5 text-orange-500" />;
    case 'GROUP_INVITE':
      return <UserPlus className="w-5 h-5 text-indigo-500" />;
    case 'CALL':
      return <Bell className="w-5 h-5 text-red-500" />;
    case 'READ_RECEIPT':
      return <Check className="w-5 h-5 text-gray-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationText = (notification: {
  type: string;
  content?: string | null;
  sender?: {
    name?: string | null;
    username?: string | null;
  } | null;
  conversation?: {
    name?: string | null;
  } | null;
}) => {
  const senderName = notification.sender?.name || notification.sender?.username || 'Someone';
  
  switch (notification.type) {
    case 'SENT_FRIEND_REQUEST':
      return `${senderName} sent you a friend request`;
    case 'FRIEND_REQUEST_ACCEPTED':
      return `${senderName} accepted your friend request`;
    case 'NEW_MESSAGE':
      return `${senderName} sent you a message`;
    case 'MENTION':
      return `${senderName} mentioned you in ${notification.conversation?.name || 'a conversation'}`;
    case 'GROUP_INVITE':
      return `${senderName} invited you to join ${notification.conversation?.name || 'a group'}`;
    case 'CALL':
      return `${senderName} is calling you`;
    case 'READ_RECEIPT':
      return `${senderName} read your message`;
    default:
      return notification.content || 'New notification';
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You`ll see notifications here when you have new activity
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                  !notification.isRead 
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                } p-6 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start space-x-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Sender Avatar */}
                  <div className="flex-shrink-0">
                    {notification.sender?.image ? (
                      <Image
                        src={notification.sender.image}
                        alt={notification.sender.name || 'User'}
                        className="w-10 h-10 rounded-full"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title || 'Notification'}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {getNotificationText(notification)}
                    </p>
                    
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>

                    {/* Message Preview for message notifications */}
                    {notification.message?.content && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          &quot;{notification.message.content}&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Friend Requests */}
                  {notification.type === 'SENT_FRIEND_REQUEST' && (
                    <AcceptOrDecline notificationId={notification.id} senderId={notification.sender?.id || ''} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {unreadCount > 0 && (
          <div className="mt-8 text-center">
            <MarkAllRead />
          </div>
        )}
      </div>
    </div>
  );
}