"use client";

import { useMarkAllNotificationsRead } from '@/app/api/access/patchNotif';
import { Button } from '@/components/ui/button'
import React from 'react'
import { toast } from 'sonner' // or your preferred toast library

const MarkAllRead = () => {
    const markAllReadMutation = useMarkAllNotificationsRead();

    const handleMarkAllRead = async () => {
        try {
            await markAllReadMutation.mutateAsync();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark notifications as read');
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <Button 
            variant={'ghost'} 
            className="px-6 py-2 hover:bg-gray-300 transition-colors duration-200"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
        >
            {markAllReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
        </Button>
    );
};

export default MarkAllRead;