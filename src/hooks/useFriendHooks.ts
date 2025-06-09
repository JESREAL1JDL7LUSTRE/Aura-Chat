'use client';

import { fetchFriendRequests, friendRequestAction } from "@/app/api/access/patchFriends";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Client-side hook wrapper for friend request actions
export const useFriendRequestAction = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: friendRequestAction,
        onSuccess: () => {
            // Refresh relevant queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
            
            // Optionally refetch specific data
            queryClient.refetchQueries({ queryKey: ['notifications'] });
        },
        onError: (error) => {
            console.error('Friend request mutation failed:', error);
        }
    });
};

// Client-side hook wrapper for fetching friend requests
export const useFriendRequests = () => {
    return useMutation({
        mutationFn: fetchFriendRequests
    });
};