import apiClient from './client';
import type { Session } from '@/types';

// Backend returns the session directly with has_active_code field
export interface SessionWithCountdown extends Session {
  countdown_seconds: number;
  has_active_code: boolean;
}

export const sessionsApi = {
  // This endpoint is at /mentees/me/upcoming-session
  getNextSession: async (): Promise<SessionWithCountdown | null> => {
    const response = await apiClient.get<SessionWithCountdown | null>(
      '/mentees/me/upcoming-session'
    );
    return response.data;
  },

  getSession: async (id: number): Promise<Session> => {
    const response = await apiClient.get<Session>(`/sessions/${id}`);
    return response.data;
  },

  listSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<Session[]>('/sessions');
    return response.data;
  },
};
