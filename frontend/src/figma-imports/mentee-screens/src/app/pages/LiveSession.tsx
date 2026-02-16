import { useState } from "react";
import { Calendar, Clock, Linkedin, FileText, Link as LinkIcon, ExternalLink, CheckCircle } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function LiveSession() {
  const [attendanceCode, setAttendanceCode] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState<"pending" | "confirmed" | null>(null);
  const [isSessionActive] = useState(true); // Mock: set to false to show "code not available" state

  const handleJoinSession = () => {
    // Mock: open Google Meet
    alert("Opening live session...");
    window.open("https://google.com", "_blank");
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attendanceCode.trim()) {
      // Mock validation
      setAttendanceStatus("confirmed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl mb-2" style={{ color: '#1B4F72' }}>
            Building Scalable APIs
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#2E86C1' }} />
              <span>Saturday, March 8, 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#2E86C1' }} />
              <span>10:00 AM - 11:30 AM WAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Speaker Card */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg mb-4" style={{ color: '#1B4F72' }}>
            Speaker
          </h2>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white flex-shrink-0 text-2xl">
              AO
            </div>
            <div className="flex-1">
              <h3 className="text-xl mb-2" style={{ color: '#1B4F72' }}>
                Adaeze Okonkwo
              </h3>
              <p className="text-gray-600 mb-3">
                Senior Backend Engineer at Paystack
              </p>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Adaeze is a seasoned backend engineer with over 8 years of experience building scalable 
                payment systems. She specializes in API design, microservices architecture, and distributed 
                systems. At Paystack, she leads a team developing high-performance APIs that process 
                millions of transactions daily.
              </p>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
                style={{ color: '#2E86C1' }}
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Session Materials */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg mb-4" style={{ color: '#1B4F72' }}>
            Session Materials
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" style={{ color: '#2E86C1' }} />
                <div>
                  <p className="text-gray-900">Slide Deck - API Design Patterns</p>
                  <p className="text-xs text-gray-500">PDF Document</p>
                </div>
              </div>
              <button className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#2E86C1' }}>
                Download
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5" style={{ color: '#2E86C1' }} />
                <div>
                  <p className="text-gray-900">Recommended Reading List</p>
                  <p className="text-xs text-gray-500">External Link</p>
                </div>
              </div>
              <button className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-2" style={{ backgroundColor: '#2E86C1' }}>
                Open <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Join Session */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg mb-4" style={{ color: '#1B4F72' }}>
            Live Session
          </h2>
          <p className="text-gray-600 mb-6">
            Click the button below to join the live session via Google Meet.
          </p>
          <button
            onClick={handleJoinSession}
            className="w-full text-white py-4 rounded-lg text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1B4F72' }}
          >
            <ExternalLink className="w-5 h-5" />
            Join Live Session
          </button>
        </div>

        {/* Attendance Code */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg mb-4" style={{ color: '#1B4F72' }}>
            Attendance Code
          </h2>
          
          {!isSessionActive ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-center">
                Attendance code will be available during the session
              </p>
            </div>
          ) : attendanceStatus === "confirmed" ? (
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-green-700">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="text-lg">Attendance confirmed!</p>
                  <p className="text-sm">Status: PRESENT</p>
                </div>
              </div>
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
                />
                <button
                  type="submit"
                  className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: '#1B4F72' }}
                >
                  Submit Code
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="session" />
    </div>
  );
}
