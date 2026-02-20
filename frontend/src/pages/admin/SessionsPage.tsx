import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  User,
  Users,
  FileText,
  Link as LinkIcon,
  Linkedin,
  Settings,
} from 'lucide-react';
import {
  useSessions,
  useCreateSession,
  useUpdateSession,
  useDeleteSession,
  useAddSessionResource,
  useDeleteSessionResource,
} from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import type { Session, SessionCreateRequest, SessionUpdateRequest, SessionResourceCreateRequest } from '@/types';

type SortField = 'date' | 'title';
type SortDirection = 'asc' | 'desc';
type ResourceType = 'SPEAKER' | 'SLIDE' | 'LINK';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

interface SessionFormData {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  google_meet_link: string;
  is_core_session: boolean;
}

interface ResourceFormData {
  type: ResourceType;
  title: string;
  url: string;
  speaker_name: string;
  speaker_bio: string;
  speaker_linkedin: string;
}

const initialFormData: SessionFormData = {
  title: '',
  description: '',
  date: '',
  start_time: '',
  end_time: '',
  google_meet_link: '',
  is_core_session: true,
};

const initialResourceFormData: ResourceFormData = {
  type: 'SPEAKER',
  title: '',
  url: '',
  speaker_name: '',
  speaker_bio: '',
  speaker_linkedin: '',
};

export default function SessionsPage() {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSessions();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();
  const addResource = useAddSessionResource();
  const deleteResource = useDeleteSessionResource();

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [managingSession, setManagingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<SessionFormData>(initialFormData);
  const [resourceFormData, setResourceFormData] = useState<ResourceFormData>(initialResourceFormData);
  const [error, setError] = useState('');
  const [resourceError, setResourceError] = useState('');

  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data: SessionCreateRequest = {
      program_id: 1,
      title: formData.title,
      description: formData.description || null,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      google_meet_link: formData.google_meet_link || null,
      is_core_session: formData.is_core_session,
    };

    try {
      await createSession.mutateAsync(data);
      setShowCreateModal(false);
      setFormData(initialFormData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create session');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setError('');

    const data: SessionUpdateRequest = {
      title: formData.title,
      description: formData.description || null,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      google_meet_link: formData.google_meet_link || null,
      is_core_session: formData.is_core_session,
    };

    try {
      await updateSession.mutateAsync({ sessionId: editingSession.id, data });
      setShowEditModal(false);
      setEditingSession(null);
      setFormData(initialFormData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update session');
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await deleteSession.mutateAsync(sessionId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete session');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSession) return;
    setResourceError('');

    const data: SessionResourceCreateRequest = {
      type: resourceFormData.type,
      title: resourceFormData.title,
      url: resourceFormData.url || null,
      speaker_name: resourceFormData.type === 'SPEAKER' ? resourceFormData.speaker_name || null : null,
      speaker_bio: resourceFormData.type === 'SPEAKER' ? resourceFormData.speaker_bio || null : null,
      speaker_linkedin: resourceFormData.type === 'SPEAKER' ? resourceFormData.speaker_linkedin || null : null,
    };

    try {
      await addResource.mutateAsync({ sessionId: managingSession.id, data });
      setShowAddResourceModal(false);
      setResourceFormData(initialResourceFormData);
      // Refresh the managing session data
      const updated = sessions?.find(s => s.id === managingSession.id);
      if (updated) setManagingSession(updated);
    } catch (err: any) {
      setResourceError(err.response?.data?.detail || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!managingSession) return;
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await deleteResource.mutateAsync({ sessionId: managingSession.id, resourceId });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete resource');
    }
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || '',
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      google_meet_link: session.google_meet_link || '',
      is_core_session: session.is_core_session,
    });
    setShowEditModal(true);
  };

  const openManageModal = (session: Session) => {
    setManagingSession(session);
    setShowManageModal(true);
  };

  // Update managing session when sessions data changes
  const currentManagingSession = managingSession
    ? sessions?.find(s => s.id === managingSession.id) || managingSession
    : null;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'SPEAKER':
        return <User className="w-5 h-5 text-purple-600" />;
      case 'SLIDE':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'LINK':
        return <LinkIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl text-[#1B4F72]">Sessions</h1>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-[#1B4F72] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Session
        </button>
      </div>

      {/* Sessions - Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {sortedSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center text-gray-500">
            No sessions found. Create your first session to get started.
          </div>
        ) : (
          sortedSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{session.title}</h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      session.is_core_session
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {session.is_core_session ? 'Core' : 'Optional'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/admin/sessions/${session.id}/attendance`)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(session)}
                    className="p-2 text-gray-600 hover:text-[#2E86C1] hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#2E86C1]" />
                  {formatDate(session.date)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#2E86C1]" />
                  {formatTime(session.start_time)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sessions Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="text-left px-6 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-[#1B4F72]"
                onClick={() => handleSort('title')}
              >
                Title <SortIcon field="title" />
              </th>
              <th
                className="text-left px-6 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-[#1B4F72]"
                onClick={() => handleSort('date')}
              >
                Date <SortIcon field="date" />
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Time</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Resources</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-gray-900">{session.title}</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        session.is_core_session
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.is_core_session ? 'Core' : 'Optional'}
                    </span>
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">{session.description}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-[#2E86C1]" />
                    {formatDate(session.date)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-[#2E86C1]" />
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {session.resources?.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {session.resources.some(r => r.type === 'SPEAKER') && (
                          <span className="p-1 bg-purple-100 rounded" title="Has Speaker">
                            <User className="w-3 h-3 text-purple-600" />
                          </span>
                        )}
                        {session.resources.some(r => r.type === 'SLIDE') && (
                          <span className="p-1 bg-blue-100 rounded" title="Has Slides">
                            <FileText className="w-3 h-3 text-blue-600" />
                          </span>
                        )}
                        {session.resources.some(r => r.type === 'LINK') && (
                          <span className="p-1 bg-green-100 rounded" title="Has Links">
                            <LinkIcon className="w-3 h-3 text-green-600" />
                          </span>
                        )}
                        <span className="text-xs text-gray-500 ml-1">
                          ({session.resources.length})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/sessions/${session.id}/attendance`)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Attendance"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openManageModal(session)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Manage Resources"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(session)}
                      className="p-2 text-gray-600 hover:text-[#2E86C1] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedSessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No sessions found. Create your first session to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl text-[#1B4F72]">Create Session</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">Core Session</label>
                  <select
                    value={formData.is_core_session ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, is_core_session: e.target.value === 'true' })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  >
                    <option value="true">Yes (Core)</option>
                    <option value="false">No (Optional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Google Meet Link</label>
                <input
                  type="url"
                  value={formData.google_meet_link}
                  onChange={(e) => setFormData({ ...formData, google_meet_link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSession.isPending}
                  className="px-4 py-2 bg-[#1B4F72] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {createSession.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Creating...
                    </>
                  ) : (
                    'Create Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl text-[#1B4F72]">Edit Session</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSession(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">Core Session</label>
                  <select
                    value={formData.is_core_session ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, is_core_session: e.target.value === 'true' })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  >
                    <option value="true">Yes (Core)</option>
                    <option value="false">No (Optional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Google Meet Link</label>
                <input
                  type="url"
                  value={formData.google_meet_link}
                  onChange={(e) => setFormData({ ...formData, google_meet_link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSession(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSession.isPending}
                  className="px-4 py-2 bg-[#1B4F72] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {updateSession.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Resources Modal */}
      {showManageModal && currentManagingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl text-[#1B4F72]">Manage Resources</h2>
                <p className="text-sm text-gray-500">{currentManagingSession.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setManagingSession(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Add Resource Button */}
              <button
                onClick={() => {
                  setResourceFormData(initialResourceFormData);
                  setShowAddResourceModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2E86C1] hover:text-[#2E86C1] transition-colors mb-6"
              >
                <Plus className="w-5 h-5" />
                Add Resource (Speaker, Slide, or Link)
              </button>

              {/* Resources List */}
              <div className="space-y-4">
                {currentManagingSession.resources?.length > 0 ? (
                  currentManagingSession.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{resource.title}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                              {resource.type}
                            </span>
                          </div>
                          {resource.type === 'SPEAKER' && resource.speaker_name && (
                            <p className="text-sm text-gray-600 mt-1">
                              {resource.speaker_name}
                            </p>
                          )}
                          {resource.type === 'SPEAKER' && resource.speaker_bio && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {resource.speaker_bio}
                            </p>
                          )}
                          {resource.type === 'SPEAKER' && resource.speaker_linkedin && (
                            <a
                              href={resource.speaker_linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#2E86C1] hover:underline mt-1"
                            >
                              <Linkedin className="w-4 h-4" />
                              LinkedIn
                            </a>
                          )}
                          {resource.url && resource.type !== 'SPEAKER' && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#2E86C1] hover:underline mt-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {resource.type === 'SLIDE' ? 'View Slide' : 'Open Link'}
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p>No resources added yet</p>
                    <p className="text-sm">Add speakers, slides, or links to this session</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl text-[#1B4F72]">Add Resource</h2>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddResource} className="p-6 space-y-4">
              {resourceError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {resourceError}
                </div>
              )}

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Resource Type *</label>
                <select
                  value={resourceFormData.type}
                  onChange={(e) =>
                    setResourceFormData({ ...resourceFormData, type: e.target.value as ResourceType })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                >
                  <option value="SPEAKER">Speaker</option>
                  <option value="SLIDE">Slide / Document</option>
                  <option value="LINK">External Link</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 text-sm">Title *</label>
                <input
                  type="text"
                  value={resourceFormData.title}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  placeholder={
                    resourceFormData.type === 'SPEAKER'
                      ? 'e.g., Keynote Speaker'
                      : resourceFormData.type === 'SLIDE'
                        ? 'e.g., Session Slides'
                        : 'e.g., Additional Reading'
                  }
                  required
                />
              </div>

              {resourceFormData.type === 'SPEAKER' ? (
                <>
                  <div>
                    <label className="block mb-2 text-gray-700 text-sm">Speaker Name *</label>
                    <input
                      type="text"
                      value={resourceFormData.speaker_name}
                      onChange={(e) =>
                        setResourceFormData({ ...resourceFormData, speaker_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-sm">Speaker Bio</label>
                    <textarea
                      value={resourceFormData.speaker_bio}
                      onChange={(e) =>
                        setResourceFormData({ ...resourceFormData, speaker_bio: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                      rows={3}
                      placeholder="Brief bio about the speaker..."
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-sm">LinkedIn URL</label>
                    <input
                      type="url"
                      value={resourceFormData.speaker_linkedin}
                      onChange={(e) =>
                        setResourceFormData({ ...resourceFormData, speaker_linkedin: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block mb-2 text-gray-700 text-sm">
                    URL {resourceFormData.type === 'LINK' ? '*' : ''}
                  </label>
                  <input
                    type="url"
                    value={resourceFormData.url}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    placeholder={
                      resourceFormData.type === 'SLIDE'
                        ? 'https://docs.google.com/... or PDF link'
                        : 'https://...'
                    }
                    required={resourceFormData.type === 'LINK'}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addResource.isPending}
                  className="px-4 py-2 bg-[#1B4F72] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {addResource.isPending ? (
                    <>
                      <Spinner size="sm" />
                      Adding...
                    </>
                  ) : (
                    'Add Resource'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
