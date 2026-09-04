import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../shared/LoadingState';
import { Menu, Stethoscope, Activity } from 'lucide-react';

interface DashboardLayoutProps {
  allowedRoles: string[];
}

export function DashboardLayout({ allowedRoles }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* ── Mobile Top Bar ── */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 shadow-sm"
          style={{ background: 'linear-gradient(180deg, hsl(175 84% 14%) 0%, hsl(190 80% 18%) 100%)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/15">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">MediCare</span>
              <div className="flex items-center gap-1">
                <Activity className="h-2 w-2 text-emerald-400" />
                <span className="text-[9px] font-medium text-emerald-400/80 tracking-widest uppercase">
                  Health Portal
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{
          background: 'linear-gradient(90deg, hsl(175 84% 28%), hsl(190 80% 38%), hsl(175 84% 28%))',
          backgroundSize: '200% 100%',
        }} />

        <div className="p-4 sm:p-6 lg:p-7 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
