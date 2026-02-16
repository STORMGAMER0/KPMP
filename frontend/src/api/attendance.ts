import apiClient from './client';
import type { Attendance } from '@/types';

export interface JoinSessionResponse {
  attendance: Attendance;
  google_meet_link: string | null;
}

export interface SubmitCodeResponse {
  attendance: Attendance;
  message: string;
}

export const attendanceApi = {
  joinSession: async (sessionId: number): Promise<JoinSessionResponse> => {
    const response = await apiClient.post<JoinSessionResponse>('/attendance/join', {
      session_id: sessionId,
    });
    return response.data;
  },

  submitCode: async (sessionId: number, code: string): Promise<SubmitCodeResponse> => {
    const response = await apiClient.post<SubmitCodeResponse>('/attendance/submit-code', {
      session_id: sessionId,
      code: code,
    });
    return response.data;
  },

  getMyAttendance: async (sessionId: number): Promise<Attendance | null> => {
    try {
      const response = await apiClient.get<Attendance>(`/attendance/session/${sessionId}/me`);
      return response.data;
    } catch {
      return null;
    }
  },
};
