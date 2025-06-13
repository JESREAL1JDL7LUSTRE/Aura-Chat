import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ChatHeader from '@/components/Chat/ChatHeader';
import ChatContainer from '@/components/Chat/ChatContainer';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';

interface OneToOneChatPageProps {
  params: {
    userId: string;
  };
}

export default async function OneToOneChatPage({ params }: OneToOneChatPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Don't allow user to chat with themselves
  if (params.userId === session.user.id) {
    notFound();
  }

  // Get the other user
  const otherUser = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      status: true,
      lastSeen: true,
      bio: true
    }
  });

  if (!otherUser) {
    notFound();
  }

  // Find or create conversation between the two users
  let conversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      participants: {
        every: {
          userId: {
            in: [session.user.id, params.userId]
          }
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              status: true,
              lastSeen: true
            }
          }
        }
      },
      messages: {
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          file: true,
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true
                }
              }
            }
          },
          parentMessage: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  username: true
                }
              }
            }
          }
        }
      }
    }
  });

  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: params.userId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                status: true,
                lastSeen: true
              }
            }
          }
        },
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            },
            file: true,
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true
                  }
                }
              }
            },
            parentMessage: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader 
        conversation={conversation}
        otherUser={otherUser}
        currentUserId={session.user.id}
      />
      
      <div className="flex-1 overflow-hidden">
        <ChatContainer conversationId={conversation.id}>
          <MessageList 
            conversationId={conversation.id}
            initialMessages={conversation.messages.reverse()}
            currentUserId={session.user.id}
          />
          <MessageInput 
            conversationId={conversation.id}
            currentUserId={session.user.id}
          />
        </ChatContainer>
      </div>
    </div>
  );
}