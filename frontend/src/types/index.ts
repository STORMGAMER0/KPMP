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
}

// Attendance types
export type AttendanceStatus = 'NOT_JOINED' | 'PARTIAL' | 'PRESENT';

export interface Attendance {
  id: number;
  session_id: number;
  mentee_id: number;
  status: AttendanceStatus;
  joined_at: string | null;
  code_entered_at: string | null;
}

// Mentee types
export interface MenteeProfile {
  user_id: number;
  mentee_id: string;
  full_name: string;
  track: string;
  profile_pic_url: string | null;
  telegram_user_id: string | null;
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
