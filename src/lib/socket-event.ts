export interface SocketEvents {
  // Authentication
  authenticate: (data: { userId: string }) => void;
  
  // Room management
  join_conversation: (conversationId: string) => void;
  leave_conversation: (conversationId: string) => void;
  
  // Messages
  new_message: (data: { conversationId: string; message: any }) => void;
  message_received: (message: any) => void;
  message_updated: (data: { conversationId: string; message: any }) => void;
  message_read: (data: { conversationId: string; messageId: string; userId: string }) => void;
  
  // Reactions
  message_reaction: (data: { 
    conversationId: string; 
    messageId: string; 
    reaction: any; 
    action: 'added' | 'removed' 
  }) => void;
  reaction_updated: (data: any) => void;
  
  // Typing indicators
  typing_start: (data: { conversationId: string; user: any }) => void;
  typing_stop: (data: { conversationId: string; userId: string }) => void;
  user_typing: (data: { conversationId: string; user: any }) => void;
  user_stop_typing: (data: { conversationId: string; userId: string }) => void;
  
  // User status
  user_status_change: (data: { userId: string; status: string; lastSeen?: Date }) => void;
  user_activity: (data: { userId: string }) => void;
  
  // Files
  file_shared: (data: { conversationId: string; message: any }) => void;
  file_received: (message: any) => void;
  
  // Voice notes
  voice_note_start: (data: { conversationId: string; userId: string }) => void;
  voice_note_stop: (data: { conversationId: string; userId: string }) => void;
  voice_recording_started: (data: { conversationId: string; userId: string }) => void;
  voice_recording_stopped: (data: { conversationId: string; userId: string }) => void;
  
  // Groups
  participant_added: (data: { conversationId: string; participants: any[] }) => void;
  participant_removed: (data: { conversationId: string; userId: string }) => void;
  participants_updated: (data: any) => void;
  group_info_updated: (data: { conversationId: string; groupInfo: any }) => void;
  
  // Conversations
  conversation_updated: (data: { conversationId: string; updates: any }) => void;
  
  // Notifications
  notification_sent: (data: { userId: string; notification: any }) => void;
  new_notification: (notification: any) => void;
}
