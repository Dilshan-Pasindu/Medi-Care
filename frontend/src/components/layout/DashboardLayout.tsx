import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../shared/LoadingState';

interface DashboardLayoutProps {
  allowedRoles: string[];
}

export function DashboardLayout({ allowedRoles }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState message="Loading your dashboard..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    const defaultRoutes: Record<string, string> = {
      PATIENT: '/patient/dashboard',
      DOCTOR: '/doctor/dashboard',
      PHARMACIST: '/pharmacist/dashboard',
    };
    return <Navigate to={defaultRoutes[user.role] || '/login'} replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <Sidebar />
      <main className="ml-60 p-6">
        <Outlet />
      </main>
    </div>
  );
}
