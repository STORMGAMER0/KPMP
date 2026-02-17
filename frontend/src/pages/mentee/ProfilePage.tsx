import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Hash, Briefcase, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { useMenteeProfile, useUploadProfilePicture } from '@/hooks/useMenteeProfile';
import { useAuthStore } from '@/stores/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clearAuth, updateUser } = useAuthStore();
  const { data: profile, isLoading } = useMenteeProfile();
  const uploadMutation = useUploadProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const updatedProfile = await uploadMutation.mutateAsync(file);
      // Update auth store with new profile pic URL
      updateUser({
        mentee_profile: {
          mentee_id: updatedProfile.mentee_id,
          full_name: updatedProfile.full_name,
          track: updatedProfile.track,
          profile_pic_url: updatedProfile.profile_pic_url,
        },
      });
    } catch (err: any) {
      setUploadError(
        err.response?.data?.detail || err.response?.data?.message || 'Failed to upload image'
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl text-[#1B4F72]">My Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Profile picture with camera overlay */}
            <button
              onClick={handleProfilePictureClick}
              disabled={uploadMutation.isPending}
              className="relative group w-32 h-32 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#2E86C1]/30"
            >
              {profile.profile_pic_url ? (
                <img
                  src={profile.profile_pic_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16" />
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadMutation.isPending ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Camera className="w-8 h-8" />
                )}
              </div>
            </button>

            <p className="mt-2 text-sm text-gray-500">Click to change photo</p>

            {/* Upload error message */}
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}

            <h2 className="mt-4 text-xl text-[#1B4F72]">{profile.full_name}</h2>
            <p className="text-gray-600">{profile.track} Track</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="w-4 h-4 text-[#2E86C1]" />
                Full Name
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profile.full_name}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Hash className="w-4 h-4 text-[#2E86C1]" />
                Mentee ID
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profile.mentee_id}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Briefcase className="w-4 h-4 text-[#2E86C1]" />
                Track
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profile.track}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="w-4 h-4 text-[#2E86C1]" />
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {profile.email}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/change-password')}
              className="flex-1 text-white py-3 rounded-lg hover:opacity-90 transition-opacity bg-[#1B4F72]"
            >
              Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
