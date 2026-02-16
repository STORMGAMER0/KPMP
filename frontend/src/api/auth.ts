import apiClient from './client';

// Backend request/response types
export interface LoginRequest {
  identifier: string; // mentee_id or email
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  must_reset_password: boolean;
}

export interface UserInfo {
  id: number;
  email: string;
  role: 'MENTEE' | 'COORDINATOR';
  must_reset_password: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const authApi = {
  login: async (identifier: string, password: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', {
      identifier,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<UserInfo> => {
    const response = await apiClient.get<UserInfo>('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
