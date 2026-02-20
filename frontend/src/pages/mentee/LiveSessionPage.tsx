import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Linkedin,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useNextSession } from '@/hooks/useNextSession';
import { attendanceApi } from '@/api/attendance';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import type { AttendanceStatus } from '@/types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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

export default function LiveSessionPage() {
  const { data: session, isLoading, refetch } = useNextSession();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch attendance status when session loads
  useEffect(() => {
    if (session?.id) {
      attendanceApi.getMyStatus(session.id).then((status) => {
        if (status) {
          setAttendanceStatus(status.status);
        }
      }).catch(() => {
        // Ignore errors - just means no attendance record yet
      });
    }
  }, [session?.id]);

  const hasActiveCode = session?.has_active_code ?? false;

  const speakerResource = session?.resources?.find((r) => r.type === 'SPEAKER');
  const materialResources = session?.resources?.filter((r) => r.type !== 'SPEAKER') || [];

  const handleJoinSession = async () => {
    if (!session) return;

    setIsJoining(true);
    setError('');

    try {
      const attendance = await attendanceApi.joinSession(session.id);
      setAttendanceStatus(attendance.status);

      // Open Google Meet in new tab
      if (session.google_meet_link) {
        window.open(session.google_meet_link, '_blank');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to join session');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !attendanceCode.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const attendance = await attendanceApi.submitCode(session.id, attendanceCode.trim());
      setAttendanceStatus(attendance.status);
      if (attendance.status === 'PRESENT') {
        setSuccessMessage('Attendance confirmed!');
      }
      refetch(); // Refresh session data
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid attendance code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl text-[#1B4F72]">Live Session</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">No Active Session</h3>
          <p className="text-gray-500 mb-6">There's no upcoming session at the moment.</p>
          <Link
            to="/dashboard"
            className="inline-block text-white px-6 py-3 rounded-lg bg-[#1B4F72] hover:opacity-90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl mb-2 text-[#1B4F72]">{session.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2E86C1]" />
              <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2E86C1]" />
              <span>
                {formatTime(session.start_time)} - {formatTime(session.end_time)} WAT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Speaker Card */}
        {speakerResource && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-[#1B4F72]">Speaker</h2>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white flex-shrink-0 text-2xl">
                {speakerResource.speaker_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'SP'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl mb-2 text-[#1B4F72]">{speakerResource.speaker_name}</h3>
                <p className="text-gray-600 mb-3">{speakerResource.title}</p>
                {speakerResource.speaker_bio && (
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    {speakerResource.speaker_bio}
                  </p>
                )}
                {speakerResource.speaker_linkedin && (
                  <a
                    href={speakerResource.speaker_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:underline text-[#2E86C1]"
                  >
                    <Linkedin className="w-5 h-5" />
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Session Materials */}
        {materialResources.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg mb-4 text-[#1B4F72]">Session Materials</h2>
            <div className="space-y-3">
              {materialResources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {resource.type === 'SLIDE' ? (
                      <FileText className="w-5 h-5 text-[#2E86C1]" />
                    ) : (
                      <LinkIcon className="w-5 h-5 text-[#2E86C1]" />
                    )}
                    <div>
                      <p className="text-gray-900">{resource.title}</p>
                      <p className="text-xs text-gray-500">
                        {resource.type === 'SLIDE' ? 'PDF Document' : 'External Link'}
                      </p>
                    </div>
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-2 bg-[#2E86C1]"
                    >
                      {resource.type === 'SLIDE' ? 'Download' : 'Open'}
                      {resource.type === 'LINK' && <ExternalLink className="w-4 h-4" />}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join Session */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg mb-4 text-[#1B4F72]">Live Session</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to join the live session via Google Meet.
          </p>
          <button
            onClick={handleJoinSession}
            disabled={isJoining}
            className="w-full text-white py-4 rounded-lg text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-[#1B4F72] disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <Spinner size="sm" />
                Joining...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Join Live Session
              </>
            )}
          </button>
          {attendanceStatus === 'PARTIAL' && (
            <p className="text-sm text-amber-600 mt-3 text-center">
              You've joined the session. Submit the attendance code to mark your presence.
            </p>
          )}
        </div>

        {/* Attendance Code */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg mb-4 text-[#1B4F72]">Attendance Code</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {attendanceStatus === 'PRESENT' || successMessage ? (
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-green-700">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="text-lg">Attendance confirmed!</p>
                  <p className="text-sm">Status: PRESENT</p>
                </div>
              </div>
            </div>
          ) : !hasActiveCode ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-center">
                Attendance code will be available during the session
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Enter the attendance code shared during the session to mark your presence.
              </p>
              <form onSubmit={handleSubmitCode} className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., KPDF-A7X2"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap bg-[#1B4F72] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Code'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
