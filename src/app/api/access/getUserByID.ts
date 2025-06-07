import { useQuery } from '@tanstack/react-query';

const useGetUserByID = (userID:string) => {
  return useQuery({
    queryKey: ['user', userID],
    queryFn: async () => {
      const response = await fetch(`/api/method/${userID}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    },
  });
}

export default useGetUserByID
