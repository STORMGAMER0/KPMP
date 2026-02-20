import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Search,
  User,
  Mail,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useMentees, useImportMentees } from '@/hooks/useAdminData';
import { FullPageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

const TRACKS = ['All Tracks', 'ENGINEERING', 'PRODUCT', 'DESIGN'];

export default function MenteesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All Tracks');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    total: number;
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMentees = useImportMentees();

  // Fetch all mentees once (no server-side filtering)
  const { data: allMentees, isLoading, refetch } = useMentees();

  // Client-side filtering for real-time search
  const mentees = useMemo(() => {
    if (!allMentees) return [];

    return allMentees.filter((mentee) => {
      // Track filter
      if (selectedTrack !== 'All Tracks' && mentee.track !== selectedTrack) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          mentee.full_name.toLowerCase().includes(query) ||
          mentee.mentee_id.toLowerCase().includes(query) ||
          (mentee.email && mentee.email.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [allMentees, selectedTrack, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importMentees.mutateAsync(file);
      setUploadResult(result);
      refetch();
    } catch (err: any) {
      setUploadResult({
        total: 0,
        created: 0,
        skipped: 0,
        errors: [err.response?.data?.detail || 'Failed to import CSV'],
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  if (isLoading && !mentees) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl text-[#1B4F72]">Mentees</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-[#1B4F72] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Upload className="w-5 h-5" />
          Import CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or mentee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

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
      </div>

      {/* Mentees List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {mentees?.map((mentee) => (
            <Link
              key={mentee.id}
              to={`/admin/mentees/${mentee.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                {mentee.profile_pic_url ? (
                  <img
                    src={mentee.profile_pic_url}
                    alt={mentee.full_name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#2E86C1] to-[#1B4F72] flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                    {getInitials(mentee.full_name)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-medium text-gray-900 truncate">{mentee.full_name}</span>
                    <span className="text-sm text-gray-500">{mentee.mentee_id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrackColor(mentee.track)}`}>
                      {mentee.track}
                    </span>
                    {mentee.telegram_user_id && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        TG
                      </span>
                    )}
                  </div>
                  {mentee.email && (
                    <p className="text-sm text-gray-500 mt-1 truncate hidden sm:block">{mentee.email}</p>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}

          {mentees.length === 0 && (
            <div className="p-12 text-center">
              <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No mentees found</p>
              {(searchQuery || selectedTrack !== 'All Tracks') && (
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total count */}
      {mentees && mentees.length > 0 && (
        <p className="text-sm text-gray-500 mt-4">
          Showing {mentees.length} mentee{mentees.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl text-[#1B4F72]">Import Mentees</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadResult(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!uploadResult ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Upload a CSV file with mentee data. Expected columns:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 font-mono text-sm">
                    mentee_id, name, email, track, default_password
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importMentees.isPending}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#2E86C1] hover:bg-blue-50/50 transition-colors disabled:opacity-50"
                  >
                    {importMentees.isPending ? (
                      <div className="flex flex-col items-center">
                        <Spinner size="md" />
                        <span className="mt-2 text-gray-600">Importing...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <span className="text-gray-600">Click to upload CSV file</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {uploadResult.errors.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      <CheckCircle className="w-6 h-6" />
                      <div>
                        <p className="font-medium">Import Successful</p>
                        <p className="text-sm">
                          {uploadResult.created} created, {uploadResult.skipped} skipped of {uploadResult.total} total
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3 text-red-700 mb-2">
                        <AlertCircle className="w-6 h-6" />
                        <p className="font-medium">Import had errors</p>
                      </div>
                      <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                        {uploadResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setUploadResult(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Upload Another
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadResult(null);
                      }}
                      className="px-4 py-2 bg-[#1B4F72] text-white rounded-lg hover:opacity-90"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
