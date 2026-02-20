import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sessionsAdminApi,
  menteesAdminApi,
  attendanceAdminApi,
  leaderboardApi,
  telegramApi,
  dashboardApi,
} from '@/api/admin';
import type {
  SessionCreateRequest,
  SessionUpdateRequest,
  SessionResourceCreateRequest,
  MenteeAdminUpdateRequest,
  AttendanceStatus,
  TelegramMapRequest,
} from '@/types';

// Sessions hooks
export function useSessions(programId?: number) {
  return useQuery({
    queryKey: ['sessions', programId],
    queryFn: () => sessionsAdminApi.listSessions(programId),
  });
}

export function useSession(sessionId: number) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsAdminApi.getSession(sessionId),
    enabled: sessionId > 0,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionCreateRequest) => sessionsAdminApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: SessionUpdateRequest }) =>
      sessionsAdminApi.updateSession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => sessionsAdminApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useAddSessionResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: SessionResourceCreateRequest }) =>
      sessionsAdminApi.addResource(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useDeleteSessionResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, resourceId }: { sessionId: number; resourceId: number }) =>
      sessionsAdminApi.deleteResource(sessionId, resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// Mentees hooks
export function useMentees(track?: string, search?: string) {
  return useQuery({
    queryKey: ['mentees', track, search],
    queryFn: () => menteesAdminApi.listMentees(track, search),
  });
}

export function useMentee(menteeId: number) {
  return useQuery({
    queryKey: ['mentee', menteeId],
    queryFn: () => menteesAdminApi.getMentee(menteeId),
    enabled: menteeId > 0,
  });
}

export function useUpdateMentee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menteeId, data }: { menteeId: number; data: MenteeAdminUpdateRequest }) =>
      menteesAdminApi.updateMentee(menteeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
      queryClient.invalidateQueries({ queryKey: ['mentee'] });
    },
  });
}

export function useImportMentees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => menteesAdminApi.importMentees(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
    },
  });
}

// Attendance hooks
export function useGenerateAttendanceCode() {
  return useMutation({
    mutationFn: (sessionId: number) => attendanceAdminApi.generateCode(sessionId),
  });
}

export function useSessionAttendance(sessionId: number) {
  return useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: () => attendanceAdminApi.getSessionAttendance(sessionId),
    enabled: sessionId > 0,
  });
}

export function useOverrideAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, status }: { attendanceId: number; status: AttendanceStatus }) =>
      attendanceAdminApi.overrideAttendance(attendanceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      menteeProfileId,
      status,
    }: {
      sessionId: number;
      menteeProfileId: number;
      status: AttendanceStatus;
    }) => attendanceAdminApi.createAttendance(sessionId, menteeProfileId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

// Leaderboard hooks
export function useLeaderboard(programId: number = 1, track?: string) {
  return useQuery({
    queryKey: ['leaderboard', programId, track],
    queryFn: () => leaderboardApi.getLeaderboard(programId, track),
  });
}

// Telegram hooks
export function useUnmappedTelegramUsers() {
  return useQuery({
    queryKey: ['telegram', 'unmapped'],
    queryFn: () => telegramApi.listUnmappedUsers(),
  });
}

export function useMapTelegramUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TelegramMapRequest) => telegramApi.mapUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram', 'unmapped'] });
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
    },
  });
}

export function useRemoveTelegramMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menteeId: number) => telegramApi.removeMapping(menteeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram', 'unmapped'] });
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
    },
  });
}

// Dashboard Stats hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });
}
