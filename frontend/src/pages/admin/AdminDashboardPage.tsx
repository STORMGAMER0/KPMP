import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  Trophy,
  MessageSquare,
  ChevronRight,
  Copy,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useSessions,
  useMentees,
  useLeaderboard,
  useUnmappedTelegramUsers,
  useGenerateAttendanceCode,
} from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function AdminDashboardPage() {
  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const { data: mentees, isLoading: loadingMentees } = useMentees();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard();
  const { data: unmappedUsers } = useUnmappedTelegramUsers();

  const generateCode = useGenerateAttendanceCode();
  const [generatedCode, setGeneratedCode] = useState<{ code: string; expires_at: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Find upcoming/current session
  const now = new Date();
  const upcomingSession = sessions
    ?.filter((s) => new Date(s.date) >= new Date(now.toDateString()))
    ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Calculate stats
  const totalMentees = mentees?.length || 0;
  const totalSessions = sessions?.length || 0;
  const unmappedCount = unmappedUsers?.length || 0;

  // Top 3 from leaderboard
  const topMentees = leaderboard?.slice(0, 3) || [];

  const handleGenerateCode = async () => {
    if (!upcomingSession) return;
    setCodeError('');

    try {
      const result = await generateCode.mutateAsync(upcomingSession.id);
      setGeneratedCode(result);
      setCopiedCode(false);
    } catch (err: any) {
      setCodeError(err.response?.data?.detail || 'Failed to generate code');
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loadingSessions || loadingMentees || loadingLeaderboard) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      <h1 className="text-2xl text-[#1B4F72] mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/admin/mentees"
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Mentees</p>
              <p className="text-3xl font-bold text-[#1B4F72]">{totalMentees}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#2E86C1]" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/sessions"
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-3xl font-bold text-[#1B4F72]">{totalSessions}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/leaderboard"
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Leaderboard</p>
              <p className="text-3xl font-bold text-[#1B4F72]">{leaderboard?.length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/telegram"
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unmapped Users</p>
              <p className="text-3xl font-bold text-[#1B4F72]">{unmappedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Session & Attendance Code */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg text-[#1B4F72] mb-4">Upcoming Session</h2>

          {upcomingSession ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 text-lg">{upcomingSession.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#2E86C1]" />
                    {formatDate(upcomingSession.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#2E86C1]" />
                    {formatTime(upcomingSession.start_time)} - {formatTime(upcomingSession.end_time)}
                  </div>
                </div>
              </div>

              {/* Attendance Code Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Attendance Code</h4>

                {codeError && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {codeError}
                  </div>
                )}

                {generatedCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-2xl text-center tracking-wider">
                        {generatedCode.code}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="p-3 bg-[#2E86C1] text-white rounded-lg hover:opacity-90 transition-opacity"
                        title="Copy code"
                      >
                        {copiedCode ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Expires: {new Date(generatedCode.expires_at).toLocaleTimeString()}
                      </p>
                      <button
                        onClick={handleGenerateCode}
                        disabled={generateCode.isPending}
                        className="flex items-center gap-2 text-sm text-[#2E86C1] hover:underline"
                      >
                        <RefreshCw className={`w-4 h-4 ${generateCode.isPending ? 'animate-spin' : ''}`} />
                        Generate New
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    disabled={generateCode.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B4F72] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {generateCode.isPending ? (
                      <>
                        <Spinner size="sm" />
                        Generating...
                      </>
                    ) : (
                      'Generate Attendance Code'
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p>No upcoming sessions</p>
              <Link to="/admin/sessions" className="text-[#2E86C1] hover:underline text-sm mt-2 inline-block">
                Create a session
              </Link>
            </div>
          )}
        </div>

        {/* Top Mentees */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[#1B4F72]">Top Performers</h2>
            <Link to="/admin/leaderboard" className="text-[#2E86C1] text-sm hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {topMentees.length > 0 ? (
            <div className="space-y-4">
              {topMentees.map((entry, index) => (
                <div key={entry.mentee_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.full_name}</p>
                      <p className="text-xs text-gray-500">{entry.track}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1B4F72]">{entry.total_score.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p>No leaderboard data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/admin/sessions"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-8 h-8 mx-auto text-[#2E86C1] mb-2" />
          <p className="text-sm font-medium text-gray-700">Manage Sessions</p>
        </Link>
        <Link
          to="/admin/mentees"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <Users className="w-8 h-8 mx-auto text-[#2E86C1] mb-2" />
          <p className="text-sm font-medium text-gray-700">Manage Mentees</p>
        </Link>
        <Link
          to="/admin/leaderboard"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <Trophy className="w-8 h-8 mx-auto text-[#2E86C1] mb-2" />
          <p className="text-sm font-medium text-gray-700">View Leaderboard</p>
        </Link>
        <Link
          to="/admin/telegram"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="w-8 h-8 mx-auto text-[#2E86C1] mb-2" />
          <p className="text-sm font-medium text-gray-700">Telegram Mapping</p>
        </Link>
      </div>
    </div>
  );
}
