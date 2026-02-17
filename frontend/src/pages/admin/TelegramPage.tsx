import { useState } from 'react';
import {
  MessageSquare,
  Link,
  Unlink,
  Search,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useUnmappedTelegramUsers,
  useMentees,
  useMapTelegramUser,
  useRemoveTelegramMapping,
} from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import type { UnmappedTelegramUser, MenteeProfile } from '@/types';

export default function TelegramPage() {
  const { data: unmappedUsers, isLoading: loadingUnmapped } = useUnmappedTelegramUsers();
  const { data: mentees, isLoading: loadingMentees } = useMentees();

  const mapUser = useMapTelegramUser();
  const removeMapping = useRemoveTelegramMapping();

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedTelegramUser, setSelectedTelegramUser] = useState<UnmappedTelegramUser | null>(null);
  const [menteeSearch, setMenteeSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get mentees with telegram linked
  const mappedMentees = mentees?.filter((m) => m.telegram_user_id !== null) || [];

  // Filter mentees for mapping (no telegram linked)
  const availableMentees = mentees?.filter(
    (m) =>
      m.telegram_user_id === null &&
      (menteeSearch === '' ||
        m.full_name.toLowerCase().includes(menteeSearch.toLowerCase()) ||
        m.mentee_id.toLowerCase().includes(menteeSearch.toLowerCase()))
  ) || [];

  const handleMap = async (mentee: MenteeProfile) => {
    if (!selectedTelegramUser) return;
    setError('');
    setSuccess('');

    try {
      await mapUser.mutateAsync({
        telegram_user_id: selectedTelegramUser.telegram_user_id,
        mentee_profile_id: mentee.id,
      });
      setSuccess(`Successfully mapped ${selectedTelegramUser.display_name || selectedTelegramUser.username} to ${mentee.full_name}`);
      setShowMapModal(false);
      setSelectedTelegramUser(null);
      setMenteeSearch('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to map user');
    }
  };

  const handleUnmap = async (menteeId: number, menteeName: string) => {
    if (!confirm(`Remove Telegram mapping for ${menteeName}?`)) return;

    try {
      await removeMapping.mutateAsync(menteeId);
      setSuccess(`Removed Telegram mapping for ${menteeName}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove mapping');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loadingUnmapped || loadingMentees) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#1B4F72]">Telegram Mapping</h1>
        <p className="text-gray-600 mt-1">
          Link Telegram accounts to mentee profiles for participation tracking
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Unmapped Users */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg text-[#1B4F72]">Unmapped Telegram Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Users who have sent messages but aren't linked to any mentee profile
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {unmappedUsers?.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.display_name || user.username || `User ${user.telegram_user_id}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.username && `@${user.username} • `}
                    {user.message_count} messages • First seen {formatDate(user.first_seen_at)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTelegramUser(user);
                  setShowMapModal(true);
                  setError('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#2E86C1] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Link className="w-4 h-4" />
                Map to Mentee
              </button>
            </div>
          ))}

          {unmappedUsers?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p>No unmapped Telegram users</p>
              <p className="text-sm mt-1">
                All active Telegram users are linked to mentee profiles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mapped Mentees */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg text-[#1B4F72]">Mapped Mentees</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mentees with linked Telegram accounts
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {mappedMentees.map((mentee) => (
            <div
              key={mentee.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white font-medium">
                  {mentee.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{mentee.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {mentee.mentee_id} • Telegram ID: {mentee.telegram_user_id}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUnmap(mentee.id, mentee.full_name)}
                disabled={removeMapping.isPending}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {removeMapping.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Remove
              </button>
            </div>
          ))}

          {mappedMentees.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No mentees have linked Telegram accounts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && selectedTelegramUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl text-[#1B4F72]">Map Telegram User</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Linking: {selectedTelegramUser.display_name || selectedTelegramUser.username || `User ${selectedTelegramUser.telegram_user_id}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  setSelectedTelegramUser(null);
                  setMenteeSearch('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentees..."
                  value={menteeSearch}
                  onChange={(e) => setMenteeSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {availableMentees.map((mentee) => (
                  <button
                    key={mentee.id}
                    onClick={() => handleMap(mentee)}
                    disabled={mapUser.isPending}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white font-medium">
                        {mentee.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{mentee.full_name}</div>
                        <div className="text-sm text-gray-500">{mentee.mentee_id}</div>
                      </div>
                    </div>
                    {mapUser.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <Link className="w-5 h-5 text-[#2E86C1]" />
                    )}
                  </button>
                ))}

                {availableMentees.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    {menteeSearch ? (
                      <p>No mentees found matching "{menteeSearch}"</p>
                    ) : (
                      <p>All mentees have been mapped</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
