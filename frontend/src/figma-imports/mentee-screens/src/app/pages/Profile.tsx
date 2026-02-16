import { useState } from "react";
import { Camera, User, Mail, Hash, Briefcase } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function Profile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl" style={{ color: '#1B4F72' }}>
            My Profile
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16" />
                )}
              </div>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#2E86C1' }}
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={() => document.getElementById("photo-upload")?.click()}
              className="text-white px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#2E86C1' }}
            >
              Upload Photo
            </button>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="w-4 h-4" style={{ color: '#2E86C1' }} />
                Full Name
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                Emmanuel Adebayo
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Hash className="w-4 h-4" style={{ color: '#2E86C1' }} />
                Mentee ID
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                KPDF-042
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Briefcase className="w-4 h-4" style={{ color: '#2E86C1' }} />
                Track
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                Backend Engineering
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="w-4 h-4" style={{ color: '#2E86C1' }} />
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                emmanuel@email.com
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="mb-4" style={{ color: '#1B4F72' }}>
              Program Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Enrollment Date</p>
                <p className="text-gray-900">January 15, 2026</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Program Duration</p>
                <p className="text-gray-900">6 Months</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sessions Attended</p>
                <p className="text-gray-900">8 of 16</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-gray-900">50%</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#1B4F72' }}
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="flex-1 bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="profile" />
    </div>
  );
}
