import apiClient from './client';

// Matches backend MenteeProfileResponse
export interface MenteeProfile {
  id: number;
  mentee_id: string;
  full_name: string;
  email: string;
  track: string;
  profile_pic_url: string | null;
  telegram_user_id: number | null;
  created_at: string;
}

export const menteesApi = {
  getMe: async (): Promise<MenteeProfile> => {
    const response = await apiClient.get<MenteeProfile>('/mentees/me');
    return response.data;
  },

  updateProfilePicture: async (profilePicUrl: string): Promise<MenteeProfile> => {
    const response = await apiClient.patch<MenteeProfile>('/mentees/me', {
      profile_pic_url: profilePicUrl,
    });
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<MenteeProfile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<MenteeProfile>(
      '/mentees/me/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
