import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menteesApi, type MenteeProfile } from '@/api/mentees';

export function useMenteeProfile() {
  return useQuery<MenteeProfile>({
    queryKey: ['mentee', 'me'],
    queryFn: menteesApi.getMe,
  });
}

export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menteesApi.uploadProfilePicture,
    onSuccess: (data) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(['mentee', 'me'], data);
    },
  });
}
