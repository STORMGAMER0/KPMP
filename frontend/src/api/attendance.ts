import apiClient from './client';

// Matches backend AttendanceResponse
export interface AttendanceResponse {
  id: number;
  session_id: number;
  mentee_id: number;
  status: 'NOT_JOINED' | 'PARTIAL' | 'PRESENT';
  joined_at: string | null;
  code_entered_at: string | null;
  created_at: string;
}

export const attendanceApi = {
  joinSession: async (sessionId: number): Promise<AttendanceResponse> => {
    const response = await apiClient.post<AttendanceResponse>('/attendance/join', {
      session_id: sessionId,
    });
    return response.data;
  },

  submitCode: async (sessionId: number, code: string): Promise<AttendanceResponse> => {
    const response = await apiClient.post<AttendanceResponse>('/attendance/code', {
      session_id: sessionId,
      code: code,
    });
    return response.data;
  },
};
