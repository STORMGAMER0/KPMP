import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Users, Filter } from 'lucide-react';
import apiClient from '@/api/client';
import { useMentees } from '@/hooks/useAdminData';
import Spinner from '@/components/ui/Spinner';

interface BulkEmailResponse {
  message: string;
  recipient_count: number;
}

export default function EmailPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'track' | 'selected'>('all');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedMentees, setSelectedMentees] = useState<number[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracks
  const { data: tracksData } = useQuery({
    queryKey: ['email', 'tracks'],
    queryFn: async () => {
      const response = await apiClient.get<{ tracks: string[] }>('/email/tracks');
      return response.data.tracks;
    },
  });

  // Fetch mentees for selection
  const { data: mentees } = useMentees();

  // Send email mutation
  const sendEmail = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<BulkEmailResponse>('/email/send', {
        subject,
        message,
        recipient_type: recipientType,
        track: recipientType === 'track' ? selectedTrack : null,
        mentee_ids: recipientType === 'selected' ? selectedMentees : null,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(`Email queued for ${data.recipient_count} recipients`);
      setError(null);
      // Reset form
      setSubject('');
      setMessage('');
      setSelectedMentees([]);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to send email');
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in subject and message');
      return;
    }

    if (recipientType === 'track' && !selectedTrack) {
      setError('Please select a track');
      return;
    }

    if (recipientType === 'selected' && selectedMentees.length === 0) {
      setError('Please select at least one mentee');
      return;
    }

    sendEmail.mutate();
  };

  const toggleMentee = (id: number) => {
    setSelectedMentees((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const getRecipientCount = () => {
    if (recipientType === 'all') return mentees?.length || 0;
    if (recipientType === 'track') {
      return mentees?.filter((m) => m.track === selectedTrack).length || 0;
    }
    return selectedMentees.length;
  };

  return (
    <div>
      <h1 className="text-2xl text-[#1B4F72] mb-6">Send Email</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipients Panel - Show first on mobile */}
        <div className="lg:hidden bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg text-[#1B4F72] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recipients
          </h2>

          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="radio"
                name="recipientTypeMobile"
                checked={recipientType === 'all'}
                onChange={() => setRecipientType('all')}
                className="text-[#2E86C1]"
              />
              <span className="text-sm">All ({mentees?.length || 0})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="radio"
                name="recipientTypeMobile"
                checked={recipientType === 'track'}
                onChange={() => setRecipientType('track')}
                className="text-[#2E86C1]"
              />
              <span className="text-sm">By Track</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg">
              <input
                type="radio"
                name="recipientTypeMobile"
                checked={recipientType === 'selected'}
                onChange={() => setRecipientType('selected')}
                className="text-[#2E86C1]"
              />
              <span className="text-sm">Select ({selectedMentees.length})</span>
            </label>
          </div>

          {recipientType === 'track' && (
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] text-sm"
            >
              <option value="">Choose a track...</option>
              {tracksData?.map((track) => (
                <option key={track} value={track}>
                  {track} ({mentees?.filter((m) => m.track === track).length})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Compose Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg text-[#1B4F72] mb-4">Compose Email</h2>

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1]"
                  disabled={sendEmail.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here... Use {{name}} to personalize with mentee's name."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] resize-none"
                  disabled={sendEmail.isPending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> to include the mentee's name.
                </p>
              </div>

              <button
                type="submit"
                disabled={sendEmail.isPending}
                className="w-full flex items-center justify-center gap-2 bg-[#1B4F72] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {sendEmail.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to {getRecipientCount()} Recipients
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recipients Panel - Desktop only */}
        <div className="hidden lg:block bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg text-[#1B4F72] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recipients
          </h2>

          <div className="space-y-4">
            {/* Recipient Type Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  checked={recipientType === 'all'}
                  onChange={() => setRecipientType('all')}
                  className="text-[#2E86C1]"
                />
                <span>All Mentees ({mentees?.length || 0})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  checked={recipientType === 'track'}
                  onChange={() => setRecipientType('track')}
                  className="text-[#2E86C1]"
                />
                <span>By Track</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  checked={recipientType === 'selected'}
                  onChange={() => setRecipientType('selected')}
                  className="text-[#2E86C1]"
                />
                <span>Select Individually</span>
              </label>
            </div>

            {/* Track Selection */}
            {recipientType === 'track' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Select Track
                </label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1]"
                >
                  <option value="">Choose a track...</option>
                  {tracksData?.map((track) => (
                    <option key={track} value={track}>
                      {track} ({mentees?.filter((m) => m.track === track).length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Individual Selection */}
            {recipientType === 'selected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Mentees ({selectedMentees.length} selected)
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {mentees?.map((mentee) => (
                    <label
                      key={mentee.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMentees.includes(mentee.id)}
                        onChange={() => toggleMentee(mentee.id)}
                        className="text-[#2E86C1]"
                      />
                      <div>
                        <p className="text-sm font-medium">{mentee.full_name}</p>
                        <p className="text-xs text-gray-500">{mentee.track}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
