'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  X,
} from 'lucide-react';
import FilePreview from './FilePreview';
import EmojiPicker from './EmojiPicker';
import { toast } from 'sonner';


interface MessageInputProps {
  conversationId: string;
  currentUserId: string;
  isGroup?: boolean;
  participants?: any[];
  replyTo?: any;
  onCancelReply?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

export default function MessageInput({ 
  conversationId, 
  currentUserId,
  isGroup = false,
  replyTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const socket = useSocket();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('user_typing', { conversationId, userId: currentUserId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('user_stop_typing', { conversationId, userId: currentUserId });
    }, 2000);
  }, [socket, conversationId, currentUserId, isTyping]);

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
    handleTyping();
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 50MB.`,
          variant: "destructive",
        });
        return;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      const newFile: UploadedFile = { file, type: fileType };

      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          newFile.preview = e.target?.result as string;
          setFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setFiles(prev => [...prev, newFile]);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // Send message
  const sendMessage = async () => {
    if ((!message.trim() && files.length === 0) || sending) return;

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('content', message.trim());
      formData.append('conversationId', conversationId);
      
      if (replyTo) {
        formData.append('parentMessageId', replyTo.id);
      }

      // Add files to form data
      files.forEach((fileData, index) => {
        formData.append(`files`, fileData.file);
      });

      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear form
      setMessage('');
      setFiles([]);
      if (onCancelReply) onCancelReply();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Stop typing indicator
      if (isTyping && socket) {
        socket.emit('user_stop_typing', { conversationId, userId: currentUserId });
        setIsTyping(false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Stop typing when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (isTyping && socket) {
        socket.emit('user_stop_typing', { conversationId, userId: currentUserId });
      }
    };
  }, [conversationId, socket, isTyping, currentUserId]);

  const canSend = (message.trim() || files.length > 0) && !sending;

  return (
    <div className="border-t bg-white p-4">
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <div className="flex-1 text-sm">
            <div className="font-medium">Replying to {replyTo.sender.name}</div>
            <div className="text-gray-600 truncate">
              {replyTo.content || (replyTo.file ? `📎 ${replyTo.file.name}` : 'Message')}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((fileData, index) => (
            <FilePreview
              key={index}
              file={fileData}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      {/* Message input */}
      <div className="flex items-end gap-2">
        {/* File attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyPress}
            placeholder={isGroup ? "Message group..." : "Type a message..."}
            className="min-h-[40px] max-h-[120px] resize-none pr-10"
            disabled={sending}
          />
          
          {/* Emoji button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-1 top-1 h-8 w-8 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClickOutside={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Send button */}
        <Button
          onClick={sendMessage}
          disabled={!canSend}
          size="sm"
          className="shrink-0"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
