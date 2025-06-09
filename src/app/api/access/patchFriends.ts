
export const friendRequestAction = async ({ 
    notificationId, 
    friendId, 
    action 
}: { 
    notificationId: string;
    friendId: string;
    action: 'ACCEPT' | 'REJECT';
}) => {
    try {
        // First, handle the friend request
        const friendResponse = await fetch(`/api/method/friends/friend-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ friendId, action }),
        });

        if (!friendResponse.ok) {
            const errorText = await friendResponse.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: `HTTP ${friendResponse.status}: ${errorText}` };
            }
            throw new Error(errorData.error || `Failed to process friend request (${friendResponse.status})`);
        }

        const friendResult = await friendResponse.json();

        // Then mark the notification as read
        const notifResponse = await fetch(`/api/method/notification/${notificationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ isRead: true }),
        });

        let notificationResult = null;
        if (notifResponse.ok) {
            notificationResult = await notifResponse.json();
        } else {
            // Log notification error but don't fail the entire operation
            console.warn('Failed to mark notification as read:', notifResponse.status);
        }

        return {
            friendRequest: friendResult,
            notification: notificationResult
        };
    } catch (error) {
        console.error('Friend request action error:', error);
        throw error;
    }
};

// Server-side utility function for fetching friend requests
export const fetchFriendRequests = async () => {
    const response = await fetch('/api/method/friends/friend-request', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch friend requests');
    }

    return response.json();
};