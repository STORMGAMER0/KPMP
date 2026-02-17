import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Filter, ChevronRight } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';

const TRACKS = ['All Tracks', 'ENGINEERING', 'PRODUCT', 'DESIGN'];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [selectedTrack, setSelectedTrack] = useState('All Tracks');

  const trackFilter = selectedTrack === 'All Tracks' ? undefined : selectedTrack;
  const { data: leaderboard, isLoading } = useLeaderboard(1, trackFilter);

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'ENGINEERING':
        return 'bg-blue-100 text-blue-800';
      case 'PRODUCT':
        return 'bg-green-100 text-green-800';
      case 'DESIGN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
          <Trophy className="w-5 h-5 text-yellow-600" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
          <Medal className="w-5 h-5 text-gray-500" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
          <Medal className="w-5 h-5 text-orange-600" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-600 font-medium">
        {rank}
      </div>
    );
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-[#1B4F72]">Leaderboard</h1>

        {/* Track Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent appearance-none bg-white"
          >
            {TRACKS.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-16">Rank</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Mentee</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Track</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">
                Sessions
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">
                Meet Score
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">
                Telegram
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">
                TG Score
              </th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600 bg-blue-50">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard?.map((entry) => (
              <tr
                key={entry.mentee_id}
                onClick={() => navigate(`/admin/mentees/${entry.mentee_profile_id}`)}
                className={`hover:bg-gray-100 cursor-pointer transition-colors ${entry.rank <= 3 ? 'bg-yellow-50/30' : ''}`}
              >
                <td className="px-6 py-4">{getRankDisplay(entry.rank)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{entry.full_name}</span>
                      <span className="text-sm text-gray-500 ml-2">{entry.mentee_id}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getTrackColor(entry.track)}`}
                  >
                    {entry.track}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-gray-900">
                    {entry.sessions_attended}/{entry.total_core_sessions}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-medium text-[#2E86C1]">
                    {entry.meet_score.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-gray-600">{entry.telegram_messages}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-medium text-[#2E86C1]">
                    {entry.telegram_score.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center bg-blue-50">
                  <span className="font-bold text-[#1B4F72] text-lg">
                    {entry.total_score.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
            {leaderboard?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No leaderboard data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Scoring Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Meet Score:</span> (Sessions Attended / Total Core Sessions) x 70
          </div>
          <div>
            <span className="font-medium">Telegram Score:</span> Based on group participation (max 30 points)
          </div>
        </div>
      </div>
    </div>
  );
}
