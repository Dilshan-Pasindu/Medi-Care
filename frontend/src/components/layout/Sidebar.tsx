import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Calendar, FileText, Search, Pill, LogOut,
  Stethoscope, ClipboardList, Package
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

export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-primary-800">MediCare</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary border-l-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-danger transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
