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
    <div className="min-h-screen" style={{ background: '#f0faf9' }}>
      <Sidebar />
      <main className="ml-64 min-h-screen">
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{
          background: 'linear-gradient(90deg, hsl(175 84% 28%), hsl(190 80% 38%), hsl(175 84% 28%))',
          backgroundSize: '200% 100%',
        }} />
        <div className="p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
