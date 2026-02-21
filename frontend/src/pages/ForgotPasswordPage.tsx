import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import Spinner from '@/components/ui/Spinner';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword(identifier);
      setSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
          <div className="inline-block p-3 rounded-full mb-4 bg-green-100">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl text-[#1B4F72] mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            If an account exists with that identifier, you will receive a password reset email shortly.
          </p>
          <Link
            to="/login"
            className="inline-block text-[#2E86C1] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-4">
          <img
            src="/kpdf-logo.jpeg"
            alt="KPDF Logo"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-3 shadow-lg"
          />
          <h2 className="text-2xl text-[#1B4F72]">Forgot Password</h2>
          <p className="text-sm text-gray-600 mt-2">
            Enter your email or Mentee ID and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block mb-2 text-gray-700 text-sm">
              Email or Mentee ID
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="e.g., KPDF-001 or email@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

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
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-[#2E86C1] hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
