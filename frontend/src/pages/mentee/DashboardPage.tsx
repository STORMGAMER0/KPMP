import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Linkedin, User } from 'lucide-react';
import { useNextSession } from '@/hooks/useNextSession';
import { useMenteeProfile } from '@/hooks/useMenteeProfile';
import { FullPageSpinner } from '@/components/ui/Spinner';

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

export default function DashboardPage() {
  const { data: session, isLoading: sessionLoading } = useNextSession();
  const { data: profile, isLoading: profileLoading, error: profileError } = useMenteeProfile();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate countdown
  useEffect(() => {
    if (!session) return;

    const targetDate = new Date(`${session.date}T${session.start_time}`);

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
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (sessionLoading || profileLoading) {
    return <FullPageSpinner />;
  }

  // Handle errors gracefully
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#2E86C1] hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const speakerResource = session?.resources?.find((r) => r.type === 'SPEAKER');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl text-[#1B4F72]">
              Welcome, {profile?.full_name || 'Mentee'}
            </h1>
            <p className="text-sm text-gray-600">{profile?.track} Track</p>
          </div>
          <Link
            to="/profile"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#2E86C1] overflow-hidden"
          >
            {profile?.profile_pic_url ? (
              <img
                src={profile.profile_pic_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6" />
            )}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {session ? (
          <>
            {/* Next Session Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
              <div className="mb-4">
                <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
                  Next Upcoming Session
                </h2>
                <h3 className="text-2xl mb-4 text-[#1B4F72]">{session.title}</h3>
              </div>

              {/* Session Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-[#2E86C1]" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-[#2E86C1]" />
                  <span>
                    {formatTime(session.start_time)} - {formatTime(session.end_time)} WAT
                  </span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="mb-6 p-6 rounded-lg bg-[#f0f7fc]">
                <p className="text-sm text-gray-600 mb-3 text-center">Session starts in</p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: timeLeft.days, label: 'Days' },
                    { value: timeLeft.hours, label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Minutes' },
                    { value: timeLeft.seconds, label: 'Seconds' },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="text-3xl mb-1 text-[#1B4F72]">{item.value}</div>
                      <div className="text-xs text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speaker Section */}
              {speakerResource && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <p className="text-sm text-gray-600 mb-4">Speaker</p>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white flex-shrink-0">
                      <span className="text-xl">
                        {speakerResource.speaker_name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase() || 'SP'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 text-[#1B4F72]">{speakerResource.speaker_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{speakerResource.speaker_bio}</p>
                      {speakerResource.speaker_linkedin && (
                        <a
                          href={speakerResource.speaker_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm hover:underline text-[#2E86C1]"
                        >
                          <Linkedin className="w-4 h-4" />
                          View LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <Link
                to="/session"
                className="block w-full text-center text-white py-3 rounded-lg transition-colors hover:opacity-90 bg-[#1B4F72]"
              >
                View Session Details
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">No Upcoming Sessions</h3>
            <p className="text-gray-500">Check back later for scheduled sessions.</p>
          </div>
        )}

        {/* Profile Card */}
        {profile && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="mb-3 text-[#1B4F72]">My Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Mentee ID</p>
                <p className="font-medium">{profile.mentee_id}</p>
              </div>
              <div>
                <p className="text-gray-500">Track</p>
                <p className="font-medium">{profile.track}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
