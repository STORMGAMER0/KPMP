import apiClient from './client';
import type {
  Session,
  SessionCreateRequest,
  SessionUpdateRequest,
  SessionResource,
  SessionResourceCreateRequest,
  MenteeProfile,
  MenteeAdminUpdateRequest,
  MenteeImportResult,
  AttendanceCode,
  MenteeAttendanceDetail,
  Attendance,
  AttendanceStatus,
  LeaderboardEntry,
  UnmappedTelegramUser,
  TelegramMapRequest,
  DashboardStats,
} from '@/types';

// Session Management API
export const sessionsAdminApi = {
  listSessions: async (programId?: number): Promise<Session[]> => {
    const params = programId ? { program_id: programId } : {};
    const response = await apiClient.get<Session[]>('/sessions', { params });
    return response.data;
  },

  getSession: async (sessionId: number): Promise<Session> => {
    const response = await apiClient.get<Session>(`/sessions/${sessionId}`);
    return response.data;
  },

  createSession: async (data: SessionCreateRequest): Promise<Session> => {
    const response = await apiClient.post<Session>('/sessions', data);
    return response.data;
  },

  updateSession: async (sessionId: number, data: SessionUpdateRequest): Promise<Session> => {
    const response = await apiClient.patch<Session>(`/sessions/${sessionId}`, data);
    return response.data;
  },

  deleteSession: async (sessionId: number): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  addResource: async (sessionId: number, data: SessionResourceCreateRequest): Promise<SessionResource> => {
    const response = await apiClient.post<SessionResource>(`/sessions/${sessionId}/resources`, data);
    return response.data;
  },

  deleteResource: async (sessionId: number, resourceId: number): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}/resources/${resourceId}`);
  },
};

// Mentee Management API
export const menteesAdminApi = {
  listMentees: async (track?: string, search?: string): Promise<MenteeProfile[]> => {
    const params: Record<string, string> = {};
    if (track) params.track = track;
    if (search) params.search = search;
    const response = await apiClient.get<MenteeProfile[]>('/admin/mentees', { params });
    return response.data;
  },

  getMentee: async (menteeId: number): Promise<MenteeProfile> => {
    const response = await apiClient.get<MenteeProfile>(`/admin/mentees/${menteeId}`);
    return response.data;
  },

  updateMentee: async (menteeId: number, data: MenteeAdminUpdateRequest): Promise<MenteeProfile> => {
    const response = await apiClient.patch<MenteeProfile>(`/admin/mentees/${menteeId}`, data);
    return response.data;
  },

  importMentees: async (file: File): Promise<MenteeImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<MenteeImportResult>('/admin/mentees/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Attendance Management API
export const attendanceAdminApi = {
  generateCode: async (sessionId: number): Promise<AttendanceCode> => {
    const response = await apiClient.post<AttendanceCode>(`/attendance/sessions/${sessionId}/generate-code`);
    return response.data;
  },

  getSessionAttendance: async (sessionId: number): Promise<MenteeAttendanceDetail[]> => {
    const response = await apiClient.get<MenteeAttendanceDetail[]>(`/attendance/sessions/${sessionId}`);
    return response.data;
  },

  overrideAttendance: async (attendanceId: number, status: AttendanceStatus): Promise<Attendance> => {
    const response = await apiClient.patch<Attendance>(`/attendance/${attendanceId}`, { status });
    return response.data;
  },

  createAttendance: async (sessionId: number, menteeProfileId: number, status: AttendanceStatus): Promise<Attendance> => {
    const response = await apiClient.post<Attendance>(
      `/attendance/sessions/${sessionId}/mentee/${menteeProfileId}`,
      { status }
    );
    return response.data;
  },
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: async (programId: number = 1, track?: string): Promise<LeaderboardEntry[]> => {
    const params: Record<string, string | number> = { program_id: programId };
    if (track) params.track = track;
    const response = await apiClient.get<LeaderboardEntry[]>('/leaderboard', { params });
    return response.data;
  },
};

// Telegram API
export const telegramApi = {
  listUnmappedUsers: async (): Promise<UnmappedTelegramUser[]> => {
    const response = await apiClient.get<UnmappedTelegramUser[]>('/telegram/unmapped');
    return response.data;
  },

  mapUser: async (data: TelegramMapRequest): Promise<void> => {
    await apiClient.post('/telegram/map', data);
  },

  removeMapping: async (menteeId: number): Promise<void> => {
    await apiClient.delete(`/telegram/mapping/${menteeId}`);
  },
};

// Dashboard Stats API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
