import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import Spinner from '@/components/ui/Spinner';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Login to get tokens
      const tokenResponse = await authApi.login(identifier, password);

      // Store token first so getMe can use it
      localStorage.setItem('access_token', tokenResponse.access_token);

      // Step 2: Get user info
      const userInfo = await authApi.getMe();

      // Store auth state
      setAuth(
        {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
          must_reset_password: userInfo.must_reset_password,
        },
        tokenResponse.access_token
      );

      // Redirect based on role and password status
      if (userInfo.must_reset_password) {
        navigate('/change-password');
      } else if (userInfo.role === 'COORDINATOR') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Handle different error formats
      const detail = err.response?.data?.detail;
      let message = 'Invalid credentials';

      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors
        message = detail.map((e: any) => e.msg).join(', ');
      } else if (detail?.msg) {
        message = detail.msg;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* KPDF Logo/Name */}
        <div className="text-center mb-6">
          <img
            src="/kpdf-logo.jpeg"
            alt="KPDF Logo"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-lg"
          />
          <h1 className="text-2xl sm:text-3xl mb-1 text-[#1B4F72]">
            Kings Patriots Development Foundation
          </h1>
          <p className="text-gray-600 text-sm">Mentee Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl mb-4 text-center text-[#1B4F72]">
            Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block mb-2 text-gray-700">
                Mentee ID / Email
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="e.g., KPDF-001 or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#2E86C1] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
