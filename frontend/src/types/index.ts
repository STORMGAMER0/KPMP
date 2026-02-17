// Session types
export interface SessionResource {
  id: number;
  type: 'SLIDE' | 'LINK' | 'SPEAKER';
  title: string;
  url: string | null;
  speaker_name: string | null;
  speaker_bio: string | null;
  speaker_linkedin: string | null;
}

export interface Session {
  id: number;
  program_id: number;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  google_meet_link: string | null;
  is_core_session: boolean;
  resources: SessionResource[];
  created_at?: string;
}

export interface SessionCreateRequest {
  program_id: number;
  title: string;
  description?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  google_meet_link?: string | null;
  is_core_session?: boolean;
}

export interface SessionUpdateRequest {
  title?: string;
  description?: string | null;
  date?: string;
  start_time?: string;
  end_time?: string;
  google_meet_link?: string | null;
  is_core_session?: boolean;
}

export interface SessionResourceCreateRequest {
  type: 'SLIDE' | 'LINK' | 'SPEAKER';
  title: string;
  url?: string | null;
  speaker_name?: string | null;
  speaker_bio?: string | null;
  speaker_linkedin?: string | null;
}

// Attendance types
export type AttendanceStatus = 'NOT_JOINED' | 'ABSENT' | 'PARTIAL' | 'PRESENT';

export interface Attendance {
  id: number;
  session_id: number;
  mentee_id: number;
  status: AttendanceStatus;
  joined_at: string | null;
  code_entered_at: string | null;
}

export interface AttendanceCode {
  code: string;
  expires_at: string;
}

export interface MenteeAttendanceDetail {
  attendance_id: number | null;
  mentee_profile_id?: number;
  mentee_id: string;
  full_name: string;
  track: string;
  status: AttendanceStatus;
  joined_at: string | null;
  code_entered_at: string | null;
}

// Mentee types
export interface MenteeProfile {
  id: number;
  user_id?: number;
  mentee_id: string;
  full_name: string;
  email?: string;
  track: string;
  profile_pic_url: string | null;
  telegram_user_id: number | null;
  created_at?: string;
}

export interface MenteeAdminUpdateRequest {
  full_name?: string;
  track?: string;
  profile_pic_url?: string;
}

export interface MenteeImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  mentee_profile_id: number;
  mentee_id: string;
  full_name: string;
  track: string;
  sessions_attended: number;
  total_core_sessions: number;
  meet_score: number;
  telegram_messages: number;
  telegram_score: number;
  total_score: number;
}

// Telegram types
export interface UnmappedTelegramUser {
  id: number;
  telegram_user_id: number;
  username: string | null;
  display_name: string | null;
  chat_id: number;
  first_seen_at: string;
  message_count: number;
}

export interface TelegramMapRequest {
  telegram_user_id: number;
  mentee_profile_id: number;
}

// API Response types
export interface ApiError {
  error: string;
  message: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    role: 'MENTEE' | 'COORDINATOR';
    must_reset_password: boolean;
    mentee_profile?: MenteeProfile;
  };
}
