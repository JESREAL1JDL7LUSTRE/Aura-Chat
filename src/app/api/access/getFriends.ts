import { useQuery } from "@tanstack/react-query";

const FriendsList = (userID:string) => {
    return useQuery({
    queryKey: ['friends', userID],
    queryFn: async () => {
      const response = await fetch(`/api/method/friends/${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      return response.json();
    },
})
}

export default FriendsList;