import { useNavigate } from 'react-router-dom';
import { User, Mail, Hash, Briefcase } from 'lucide-react';
import { useMenteeProfile } from '@/hooks/useMenteeProfile';
import { useAuthStore } from '@/stores/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const { data: profile, isLoading } = useMenteeProfile();

  const handleSignOut = () => {
    clearAuth();
    navigate('/login');
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl text-[#1B4F72]">My Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white overflow-hidden">
              {profile.profile_pic_url ? (
                <img
                  src={profile.profile_pic_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16" />
              )}
            </div>
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
