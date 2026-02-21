import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import Spinner from '@/components/ui/Spinner';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const isFirstLogin = user?.must_reset_password;
  const isMentee = user?.role === 'MENTEE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Require telegram username for mentee first login
    if (isFirstLogin && isMentee && !telegramUsername.trim()) {
      setError('Please enter your Telegram username');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.changePassword(
        oldPassword,
        newPassword,
        isFirstLogin && isMentee ? telegramUsername.trim() : undefined
      );

      // Update user state to reflect password changed
      updateUser({ must_reset_password: false });

      // Redirect based on role
      if (user?.role === 'COORDINATOR') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.detail || 'Failed to change password';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <img
            src="/kpdf-logo.jpeg"
            alt="KPDF Logo"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg"
          />
          <h2 className="text-2xl text-[#1B4F72]">
            {isFirstLogin && isMentee ? 'Account Setup' : 'Change Password'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {isFirstLogin && isMentee
              ? 'Welcome! Set your password and Telegram username to get started.'
              : isFirstLogin
              ? 'This is your first login. Please change your password to continue.'
              : 'Enter your current password and choose a new one.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block mb-2 text-gray-700 text-sm">
              Current Password
            </label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block mb-2 text-gray-700 text-sm">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-gray-700 text-sm">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Telegram username field - only for mentee first login */}
          {isFirstLogin && isMentee && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <label htmlFor="telegramUsername" className="block mb-2 text-gray-700 text-sm">
                Telegram Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                <input
                  id="telegramUsername"
                  type="text"
                  placeholder="your_username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace('@', ''))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your Telegram username for group participation tracking.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-3 rounded-lg transition-colors hover:opacity-90 bg-[#1B4F72] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                {isFirstLogin && isMentee ? 'Setting up...' : 'Changing Password...'}
              </>
            ) : (
              isFirstLogin && isMentee ? 'Complete Setup' : 'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
