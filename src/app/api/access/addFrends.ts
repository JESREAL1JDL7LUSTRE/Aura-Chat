import { useMutation } from "@tanstack/react-query"

const useAddFriends = () => {
  return useMutation({
    mutationFn: async (friendID: string) => {
      // First, add the friend
      const friendResponse = await fetch(`/api/method/friends/Friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: friendID }),
      });

      if (!friendResponse.ok) {
        throw new Error('Failed to add friend');
      }

      const notificationResponse = await fetch(`/api/method/notification/${friendID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          friendId: friendID, 
          action: 'REQUEST' 
        }),
      });

      if (!notificationResponse.ok) {
        console.warn('Friend added but notification failed to send');
        // Don't throw error here - friend was added successfully
      }

      const friendData = await friendResponse.json();
      return friendData;
    }
  });
}

export default useAddFriends