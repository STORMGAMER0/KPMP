import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  User,
  Edit,
  Save,
  X,
  MessageSquare,
} from 'lucide-react';
import { useMentee, useUpdateMentee } from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

const TRACKS = ['ENGINEERING', 'PRODUCT', 'DESIGN'];

export default function MenteeDetailPage() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const navigate = useNavigate();
  const id = parseInt(menteeId || '0');

  const { data: mentee, isLoading } = useMentee(id);
  const updateMentee = useUpdateMentee();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    track: '',
  });
  const [error, setError] = useState('');

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = () => {
    if (mentee) {
      setEditData({
        full_name: mentee.full_name,
        track: mentee.track,
      });
      setIsEditing(true);
      setError('');
    }
  };

  const handleSave = async () => {
    if (!mentee) return;
    setError('');

    try {
      await updateMentee.mutateAsync({
        menteeId: mentee.id,
        data: editData,
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update mentee');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!mentee) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl text-gray-600">Mentee not found</h2>
        <Link to="/admin/mentees" className="text-[#2E86C1] hover:underline mt-2 inline-block">
          Back to mentees
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl text-[#1B4F72]">Mentee Details</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            {mentee.profile_pic_url ? (
              <img
                src={mentee.profile_pic_url}
                alt={mentee.full_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white text-2xl font-medium">
                {getInitials(mentee.full_name)}
              </div>
            )}

            {/* Info */}
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent text-xl font-medium"
                  />
                  <select
                    value={editData.track}
                    onChange={(e) => setEditData({ ...editData, track: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  >
                    {TRACKS.map((track) => (
                      <option key={track} value={track}>
                        {track}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-medium text-gray-900">{mentee.full_name}</h2>
                  <p className="text-lg text-gray-600 mt-1">{mentee.mentee_id}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getTrackColor(mentee.track)}`}
                  >
                    {mentee.track}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMentee.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1B4F72] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {updateMentee.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{mentee.email || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Telegram</p>
              <p className="text-gray-900">
                {mentee.telegram_user_id ? (
                  <span className="text-green-600">Linked (ID: {mentee.telegram_user_id})</span>
                ) : (
                  <span className="text-gray-400">Not linked</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg text-[#1B4F72] mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Profile ID</p>
            <p className="text-gray-900">{mentee.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900">
              {mentee.created_at
                ? new Date(mentee.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
