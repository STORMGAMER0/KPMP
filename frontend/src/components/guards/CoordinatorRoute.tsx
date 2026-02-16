import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface CoordinatorRouteProps {
  children: React.ReactNode;
}

export default function CoordinatorRoute({ children }: CoordinatorRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'COORDINATOR') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
