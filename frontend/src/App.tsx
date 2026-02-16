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
import DashboardPage from '@/pages/mentee/DashboardPage';
import LiveSessionPage from '@/pages/mentee/LiveSessionPage';
import ProfilePage from '@/pages/mentee/ProfilePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import SessionsPage from '@/pages/admin/SessionsPage';
import MenteesPage from '@/pages/admin/MenteesPage';
import LeaderboardPage from '@/pages/admin/LeaderboardPage';
import TelegramPage from '@/pages/admin/TelegramPage';

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
            <Route path="mentees" element={<MenteesPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="telegram" element={<TelegramPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
