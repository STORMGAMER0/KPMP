import { useEffect, useState } from "react";
import { Calendar, Clock, Linkedin, User } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate time until session
  useEffect(() => {
    const targetDate = new Date("2026-03-08T10:00:00");

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl" style={{ color: '#1B4F72' }}>
              Welcome, Emmanuel Adebayo
            </h1>
            <p className="text-sm text-gray-600">Backend Engineering Track</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#2E86C1' }}>
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Next Session Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
              Next Upcoming Session
            </h2>
            <h3 className="text-2xl mb-4" style={{ color: '#1B4F72' }}>
              Building Scalable APIs
            </h3>
          </div>

          {/* Session Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5" style={{ color: '#2E86C1' }} />
              <span>Saturday, March 8, 2026</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5" style={{ color: '#2E86C1' }} />
              <span>10:00 AM - 11:30 AM WAT</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: '#f0f7fc' }}>
            <p className="text-sm text-gray-600 mb-3 text-center">Session starts in</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1" style={{ color: '#1B4F72' }}>
                  {timeLeft.days}
                </div>
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1" style={{ color: '#1B4F72' }}>
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-gray-600">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1" style={{ color: '#1B4F72' }}>
                  {timeLeft.minutes}
                </div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1" style={{ color: '#1B4F72' }}>
                  {timeLeft.seconds}
                </div>
                <div className="text-xs text-gray-600">Seconds</div>
              </div>
            </div>
          </div>

          {/* Speaker Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <p className="text-sm text-gray-600 mb-4">Speaker</p>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white flex-shrink-0">
                <span className="text-xl">AO</span>
              </div>
              <div className="flex-1">
                <h4 className="mb-1" style={{ color: '#1B4F72' }}>
                  Adaeze Okonkwo
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Senior Backend Engineer at Paystack
                </p>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm hover:underline"
                  style={{ color: '#2E86C1' }}
                >
                  <Linkedin className="w-4 h-4" />
                  View LinkedIn Profile
                </a>
              </div>
            </div>
          </div>

          {/* View Details Button */}
          <a
            href="/session"
            className="block w-full text-center text-white py-3 rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1B4F72' }}
          >
            View Session Details
          </a>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="mb-3" style={{ color: '#1B4F72' }}>
            My Attendance
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl" style={{ color: '#2E86C1' }}>
                  8
                </span>
                <span className="text-gray-600">/</span>
                <span className="text-xl text-gray-600">16</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Sessions Attended</p>
            </div>
            <div className="w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2E86C1"
                  strokeWidth="3"
                  strokeDasharray="50, 100"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="dashboard" />
    </div>
  );
}
