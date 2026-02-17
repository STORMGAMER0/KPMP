import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Key,
  Copy,
  Check,
} from 'lucide-react';
import { useSession, useSessionAttendance, useGenerateAttendanceCode, useOverrideAttendance, useCreateAttendance } from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import type { AttendanceStatus, MenteeAttendanceDetail } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; bgColor: string; textColor: string; borderColor: string }> = {
  PRESENT: {
    label: 'Present',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  PARTIAL: {
    label: 'Partial',
    icon: Clock,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
  },
  ABSENT: {
    label: 'Absent',
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  NOT_JOINED: {
    label: 'Absent',
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
};

export default function SessionAttendancePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ code: string; expires_at: string } | null>(null);

  const { data: session, isLoading: sessionLoading } = useSession(Number(sessionId));
  const { data: attendance, isLoading: attendanceLoading, refetch } = useSessionAttendance(Number(sessionId));
  const generateCodeMutation = useGenerateAttendanceCode();
  const overrideMutation = useOverrideAttendance();
  const createAttendanceMutation = useCreateAttendance();

  const handleGenerateCode = async () => {
    try {
      const result = await generateCodeMutation.mutateAsync(Number(sessionId));
      setGeneratedCode(result);
      setCopiedCode(false);
    } catch (err) {
      console.error('Failed to generate code:', err);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleOverrideStatus = async (
    attendanceId: number | null,
    menteeProfileId: number,
    newStatus: AttendanceStatus
  ) => {
    try {
      if (attendanceId) {
        // Update existing attendance
        await overrideMutation.mutateAsync({ attendanceId, status: newStatus });
      } else {
        // Create new attendance record
        await createAttendanceMutation.mutateAsync({
          sessionId: Number(sessionId),
          menteeProfileId,
          status: newStatus,
        });
      }
      refetch();
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  };

  const getStatusCounts = () => {
    if (!attendance) return { present: 0, partial: 0, absent: 0 };
    return {
      present: attendance.filter((a) => a.status === 'PRESENT').length,
      partial: attendance.filter((a) => a.status === 'PARTIAL').length,
      absent: attendance.filter((a) => a.status === 'ABSENT' || a.status === 'NOT_JOINED').length,
    };
  };

  if (sessionLoading || attendanceLoading) {
    return <FullPageSpinner />;
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Session not found</p>
      </div>
    );
  }

  const counts = getStatusCounts();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/sessions')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl text-[#1B4F72]">Session Attendance</h1>
          <p className="text-gray-600">{session.title}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.present}</p>
              <p className="text-sm text-gray-500">Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.partial}</p>
              <p className="text-sm text-gray-500">Partial</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.absent}</p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#2E86C1]" />
              Attendance Code
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Generate a code for mentees to confirm their attendance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {generatedCode && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="font-mono text-lg font-bold text-[#1B4F72]">
                  {generatedCode.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            )}

            <button
              onClick={handleGenerateCode}
              disabled={generateCodeMutation.isPending}
              className="flex items-center gap-2 bg-[#1B4F72] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generateCodeMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {generatedCode ? 'New Code' : 'Generate Code'}
            </button>
          </div>
        </div>

        {generatedCode && (
          <p className="text-xs text-gray-500 mt-2">
            Expires: {new Date(generatedCode.expires_at).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2E86C1]" />
            Mentee Attendance ({attendance?.length || 0})
          </h3>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {attendance?.map((mentee) => (
            <AttendanceRow
              key={mentee.mentee_id}
              mentee={mentee}
              onOverride={handleOverrideStatus}
              isOverriding={overrideMutation.isPending || createAttendanceMutation.isPending}
            />
          ))}

          {(!attendance || attendance.length === 0) && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No mentees found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttendanceRow({
  mentee,
  onOverride,
  isOverriding,
}: {
  mentee: MenteeAttendanceDetail;
  onOverride: (attendanceId: number | null, menteeProfileId: number, status: AttendanceStatus) => void;
  isOverriding: boolean;
}) {
  const [showOverride, setShowOverride] = useState(false);
  const config = STATUS_CONFIG[mentee.status];
  const StatusIcon = config.icon;

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{mentee.full_name}</p>
          <p className="text-sm text-gray-500">{mentee.mentee_id} &middot; {mentee.track}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Time info */}
        <div className="text-right text-sm hidden sm:block">
          <p className="text-gray-500">
            Joined: <span className="text-gray-700">{formatTime(mentee.joined_at)}</span>
          </p>
          <p className="text-gray-500">
            Code: <span className="text-gray-700">{formatTime(mentee.code_entered_at)}</span>
          </p>
        </div>

        {/* Status badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>

        {/* Override dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOverride(!showOverride)}
            className="text-sm text-[#2E86C1] hover:underline"
          >
            Override
          </button>

          {showOverride && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowOverride(false)}
              />
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                {(['PRESENT', 'PARTIAL', 'ABSENT'] as AttendanceStatus[]).map((status) => {
                  const statusConfig = STATUS_CONFIG[status];
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        onOverride(mentee.attendance_id, mentee.mentee_profile_id!, status);
                        setShowOverride(false);
                      }}
                      disabled={isOverriding || mentee.status === status}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                        mentee.status === status ? 'bg-gray-50' : ''
                      }`}
                    >
                      <statusConfig.icon className={`w-4 h-4 ${statusConfig.textColor}`} />
                      {statusConfig.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
