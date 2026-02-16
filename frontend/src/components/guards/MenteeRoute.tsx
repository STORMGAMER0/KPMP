import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface MenteeRouteProps {
  children: React.ReactNode;
}

export default function MenteeRoute({ children }: MenteeRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'MENTEE') {
    return <Navigate to="/admin" replace />;
  }

  // Check if password reset is required
  if (user?.must_reset_password) {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
