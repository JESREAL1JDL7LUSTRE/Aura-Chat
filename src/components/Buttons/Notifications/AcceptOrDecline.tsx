"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useFriendRequestAction } from '@/hooks/useFriendHooks';

interface AcceptOrDeclineProps {
    notificationId: string;
    senderId: string; // The ID of the person who sent the friend request
}

const AcceptOrDecline: React.FC<AcceptOrDeclineProps> = ({ 
    notificationId, 
    senderId 
}) => {
    const friendRequestMutation = useFriendRequestAction();

    const handleAccept = async () => {
        try {
            console.log('Accept clicked with:', { notificationId, senderId });
            await friendRequestMutation.mutateAsync({
                notificationId,
                friendId: senderId,
                action: 'ACCEPT'
            });
            toast.success('Friend request accepted!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to accept friend request';
            toast.error(errorMessage);
            console.error('Error accepting friend request:', error);
        }
    };

    const handleDecline = async () => {
        try {
            console.log('Decline clicked with:', { notificationId, senderId });
            await friendRequestMutation.mutateAsync({
                notificationId,
                friendId: senderId,
                action: 'REJECT'
            });
            toast.success('Friend request declined');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to decline friend request';
            toast.error(errorMessage);
            console.error('Error declining friend request:', error);
        }
    };

    const isLoading = friendRequestMutation.isPending;

    return (
        <div className="flex space-x-2">
            <Button 
                variant="ghost" 
                className="hover:bg-green-300 hover:text-white transition-colors duration-200"
                onClick={handleAccept}
                disabled={isLoading}
                aria-label="Accept friend request"
            >
                {isLoading ? 'Processing...' : 'Accept'}
            </Button>
            <Button 
                variant="ghost" 
                className="hover:bg-red-300 hover:text-white transition-colors duration-200"
                onClick={handleDecline}
                disabled={isLoading}
                aria-label="Decline friend request"
            >
                {isLoading ? 'Processing...' : 'Decline'}
            </Button>
        </div>
    );
};

export default AcceptOrDecline;