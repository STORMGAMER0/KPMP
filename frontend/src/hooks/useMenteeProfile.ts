import { useQuery } from '@tanstack/react-query';
import { menteesApi, type MenteeProfile } from '@/api/mentees';

export function useMenteeProfile() {
  return useQuery<MenteeProfile>({
    queryKey: ['mentee', 'me'],
    queryFn: menteesApi.getMe,
  });
}
