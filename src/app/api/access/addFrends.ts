import { useMutation } from "@tanstack/react-query"

const useAddFrends = () => {
  return useMutation({
    mutationFn: async (friendID: string) => {
      const response = await fetch(`/api/method/friends/Friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: friendID }),
      });

      if (!response.ok) {
        throw new Error('Failed to add friend');
      }

      return response.json();
    }
});
}

export default useAddFrends
