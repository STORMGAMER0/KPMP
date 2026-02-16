import { useState } from "react";
import { useNavigate } from "react-router";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function Login() {
  const [menteeId, setMenteeId] = useState("");
  const [password, setPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login validation
    if (menteeId && password) {
      // Check if first login (simulate by checking localStorage)
      const hasChangedPassword = localStorage.getItem(`${menteeId}_passwordChanged`);
      
      if (!hasChangedPassword) {
        setShowChangePassword(true);
      } else {
        localStorage.setItem('currentMenteeId', menteeId);
        navigate('/dashboard');
      }
    }
  };

  const handlePasswordChanged = () => {
    localStorage.setItem(`${menteeId}_passwordChanged`, 'true');
    localStorage.setItem('currentMenteeId', menteeId);
    setShowChangePassword(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="w-full max-w-md">
        {/* KPDF Logo/Name */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: '#1B4F72' }}>
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-3xl mb-2" style={{ color: '#1B4F72' }}>
            Kings Patriots Development Foundation
          </h1>
          <p className="text-gray-600">Mentee Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl mb-6 text-center" style={{ color: '#1B4F72' }}>
            Sign In
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="menteeId" className="block mb-2 text-gray-700">
                Mentee ID
              </label>
              <input
                id="menteeId"
                type="text"
                placeholder="e.g., KPDF-001"
                value={menteeId}
                onChange={(e) => setMenteeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1B4F72' }}
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? Contact your administrator.
          </p>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={handlePasswordChanged}
        />
      )}
    </div>
  );
}
