import apiClient from './client';

// Matches backend AttendanceResponse
export interface AttendanceResponse {
  id: number;
  session_id: number;
  mentee_id: number;
  status: 'NOT_JOINED' | 'PARTIAL' | 'PRESENT' | 'ABSENT';
  joined_at: string | null;
  code_entered_at: string | null;
  created_at: string;
}

export const attendanceApi = {
  getMyStatus: async (sessionId: number): Promise<AttendanceResponse | null> => {
    const response = await apiClient.get<AttendanceResponse | null>(
      `/attendance/my-status/${sessionId}`
    );
    return response.data;
  },

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
