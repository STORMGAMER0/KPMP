import { useQuery } from '@tanstack/react-query';
import { sessionsApi, type SessionWithCountdown } from '@/api/sessions';

export function useNextSession() {
  return useQuery<SessionWithCountdown | null>({
    queryKey: ['sessions', 'next'],
    queryFn: sessionsApi.getNextSession,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
