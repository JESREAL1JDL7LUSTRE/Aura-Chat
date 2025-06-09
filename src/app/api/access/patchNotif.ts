import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

// Hook to mark a single notification as read
export const usePatchNotif = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (notifId: string) => {
            const response = await fetch(`/api/method/notification/${notifId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRead: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to update notification');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate notifications query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    
    return useMutation({
        mutationFn: async () => {
            if (!session?.user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`/api/method/notification/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: session.user.id }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to mark all notifications as read');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};
