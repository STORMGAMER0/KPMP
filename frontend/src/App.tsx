import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

// Guards
import { MenteeRoute, CoordinatorRoute } from '@/components/guards';

// Layouts
import { MenteeLayout, AdminLayout } from '@/components/layout';

// Pages
import LoginPage from '@/pages/LoginPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/mentee/DashboardPage';
import LiveSessionPage from '@/pages/mentee/LiveSessionPage';
import ProfilePage from '@/pages/mentee/ProfilePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import SessionsPage from '@/pages/admin/SessionsPage';
import SessionAttendancePage from '@/pages/admin/SessionAttendancePage';
import MenteesPage from '@/pages/admin/MenteesPage';
import MenteeDetailPage from '@/pages/admin/MenteeDetailPage';
import LeaderboardPage from '@/pages/admin/LeaderboardPage';
import TelegramPage from '@/pages/admin/TelegramPage';
import EmailPage from '@/pages/admin/EmailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'COORDINATOR') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.must_reset_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Password change (protected but outside layouts) */}
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Mentee routes */}
          <Route
            element={
              <MenteeRoute>
                <MenteeLayout />
              </MenteeRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/session" element={<LiveSessionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <CoordinatorRoute>
                <AdminLayout />
              </CoordinatorRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:sessionId/attendance" element={<SessionAttendancePage />} />
            <Route path="mentees" element={<MenteesPage />} />
            <Route path="mentees/:menteeId" element={<MenteeDetailPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="telegram" element={<TelegramPage />} />
            <Route path="email" element={<EmailPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
