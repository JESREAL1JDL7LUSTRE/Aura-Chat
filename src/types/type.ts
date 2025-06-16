import { Conversation, Message } from "@/generated/prisma";
import { User } from "@/generated/prisma";

export type ConversationWithMessages = Conversation & {
  messages: (Message & {
    sender: Pick<User, 'id' | 'name' | 'image'>;
    file: {
      id: string;
      url: string;
      name: string;
      type: string;
      size: number;
    } | null;
    reactions: {
      user: Pick<User, 'id' | 'name'>;
    }[];
    parentMessage: {
      sender: Pick<User, 'id' | 'name'>;
    } | null;
  })[];
  participants: {
    user: Pick<User, 'id' | 'name' | 'image'>;
  }[];
};


export type UserStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE' | 'INVISIBLE';

export type ChatHeaderProps = {
  otherUser: {
    id: string;
    name?: string;
    username?: string;
    image?: string;
    status: UserStatus;
    lastSeen?: string | null;
    bio?: string;
  };
  conversation: ConversationWithMessages;
  currentUserId: string;
};

