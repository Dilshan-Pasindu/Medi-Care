import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Calendar, FileText, Search, LogOut,
  Stethoscope, ClipboardList, Package, ChevronRight, Activity, X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: Record<string, NavItem[]> = {
  PATIENT: [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Find Specialist', path: '/patient/specialist', icon: Search },
    { label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
  ],
  DOCTOR: [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: FileText },
  ],
  PHARMACIST: [
    { label: 'Dashboard', path: '/pharmacist/dashboard', icon: LayoutDashboard },
    { label: 'Prescriptions', path: '/pharmacist/prescriptions', icon: ClipboardList },
    { label: 'Inventory', path: '/pharmacist/inventory', icon: Package },
  ],
};

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  PATIENT: { label: 'Patient', color: 'text-emerald-300', bg: 'bg-emerald-400/20' },
  DOCTOR: { label: 'Doctor', color: 'text-cyan-300', bg: 'bg-cyan-400/20' },
  PHARMACIST: { label: 'Pharmacist', color: 'text-teal-300', bg: 'bg-teal-400/20' },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = navItems[user.role] || [];
  const role = roleConfig[user.role] || { label: user.role, color: 'text-white/70', bg: 'bg-white/10' };
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const sidebarContent = (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 flex flex-col shadow-sidebar transition-transform duration-300 ease-in-out',
        // On mobile: slide in/out. On lg+: always visible.
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      style={{ background: 'linear-gradient(180deg, hsl(175 84% 14%) 0%, hsl(190 80% 18%) 100%)' }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 shadow-inner-glow">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">MediCare</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Activity className="h-2.5 w-2.5 text-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400/80 tracking-widest uppercase">
                  Health Portal
                </span>
              </div>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 h-px bg-white/10" />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="px-3 mb-2 text-[10px] font-bold text-white/35 tracking-widest uppercase">
          Navigation
        </p>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'nav-item group relative',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-r-full" />
                )}
                <div className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive ? 'bg-white/20' : 'bg-white/8 group-hover:bg-white/15'
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User Profile & Logout ── */}
      <div className="px-3 pb-5">
        <div className="h-px bg-white/10 mb-3" />

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/8 mb-2">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(175 84% 40%), hsl(190 80% 50%))' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
            <span className={cn('inline-block mt-0.5 px-2 py-px text-[10px] font-bold rounded-full', role.bg, role.color)}>
              {role.label}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-red-500/20 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {sidebarContent}
    </>
  );
}
