import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface GroupChatPageProps {
  params: {
    groupId: string;
  };
}

export default async function GroupChatPage({ params }: GroupChatPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get the group conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: params.groupId,
      isGroup: true,
      participants: {
        some: { 
          userId: session.user.id,
          leftAt: null // User hasn't left the group
        }
      }
    },
    include: {
      groupDetails: true,
      participants: {
        where: { leftAt: null },
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
        },
        orderBy: [
          { isAdmin: 'desc' },
          { joinedAt: 'asc' }
        ]
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

  if (!conversation || !conversation.groupDetails) {
    notFound();
  }

  // Check if current user is a participant
  const currentParticipant = conversation.participants.find(
    p => p.userId === session.user.id
  );

  if (!currentParticipant) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <GroupChatHeader 
        conversation={conversation}
        groupDetails={conversation.groupDetails}
        participants={conversation.participants}
        currentUserId={session.user.id}
        isAdmin={currentParticipant.isAdmin}
      />
      
      <div className="flex-1 overflow-hidden">
        <ChatContainer conversationId={conversation.id}>
          <MessageList 
            conversationId={conversation.id}
            initialMessages={conversation.messages.reverse()}
            currentUserId={session.user.id}
            isGroup={true}
          />
          <MessageInput 
            conversationId={conversation.id}
            currentUserId={session.user.id}
            isGroup={true}
            participants={conversation.participants}
          />
        </ChatContainer>
      </div>
    </div>
  );
}
