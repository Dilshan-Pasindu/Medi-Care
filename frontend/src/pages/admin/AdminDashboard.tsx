import { useEffect, useState, useCallback } from 'react';
import { adminService, AdminUser } from '../../services/admin.service';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users, ShieldCheck, UserCog, RefreshCw, Search,
  ChevronDown, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';

type Role = 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

const ROLE_OPTIONS: Role[] = ['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN'];

const ROLE_STYLE: Record<Role, { badge: string; dot: string }> = {
  PATIENT:    { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  DOCTOR:     { badge: 'bg-cyan-500/15    text-cyan-400    border border-cyan-500/25',    dot: 'bg-cyan-400'    },
  PHARMACIST: { badge: 'bg-teal-500/15   text-teal-400   border border-teal-500/25',   dot: 'bg-teal-400'   },
  ADMIN:      { badge: 'bg-rose-500/15   text-rose-400   border border-rose-500/25',   dot: 'bg-rose-400'   },
};

function RoleBadge({ role }: { role: Role }) {
  const s = ROLE_STYLE[role] || ROLE_STYLE.PATIENT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {role}
    </span>
  );
}

interface Toast { id: number; type: 'success' | 'error'; message: string }

export default function AdminDashboard() {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'ALL') {
      list = list.filter(u => u.role === roleFilter);
    }
    setFiltered(list);
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (userId === adminUser?.id) {
      addToast('error', 'You cannot change your own role.');
      return;
    }
    setUpdating(userId);
    try {
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      addToast('success', `Role updated to ${newRole} successfully.`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  // Stats
  const counts = ROLE_OPTIONS.reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {} as Record<Role, number>);

  return (
    <div className="space-y-6">
      {/* ── Toasts ── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in
              ${t.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-700/60'
                : 'bg-rose-900/90 text-rose-200 border border-rose-700/60'
              }`}
          >
            {t.type === 'success'
              ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              : <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            }
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-teal-600" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user roles — promote patients to doctors or pharmacists.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { role: 'PATIENT' as Role,    icon: Users,    label: 'Patients',    color: 'from-emerald-500 to-teal-500' },
          { role: 'DOCTOR' as Role,     icon: UserCog,  label: 'Doctors',     color: 'from-cyan-500 to-blue-500'    },
          { role: 'PHARMACIST' as Role, icon: ShieldCheck, label: 'Pharmacists', color: 'from-teal-500 to-cyan-500' },
          { role: 'ADMIN' as Role,      icon: ShieldCheck, label: 'Admins',    color: 'from-rose-500 to-pink-500'   },
        ].map(({ role, icon: Icon, label, color }) => (
          <div
            key={role}
            onClick={() => setRoleFilter(prev => prev === role ? 'ALL' : role)}
            className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-200 shadow-sm
              ${roleFilter === role ? 'ring-2 ring-offset-1 ring-teal-400 scale-[1.02]' : 'hover:scale-[1.01]'} bg-white`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.08]`} />
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} mb-2`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{counts[role]}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── User Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Table toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50 bg-gray-50"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as Role | 'ALL')}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50 bg-gray-50 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Current Role</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Joined</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => {
                    const isSelf = u.id === adminUser?.id;
                    const isUpdating = updating === u.id;
                    return (
                      <tr key={u.id} className={`hover:bg-gray-50/60 transition-colors ${isSelf ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: 'linear-gradient(135deg, hsl(175 84% 40%), hsl(190 80% 50%))' }}
                            >
                              {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{u.name}</span>
                            {isSelf && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-semibold">YOU</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                        <td className="px-5 py-3.5"><RoleBadge role={u.role as Role} /></td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-right">
                          {isUpdating ? (
                            <div className="flex justify-end">
                              <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                            </div>
                          ) : (
                            <div className="relative inline-block">
                              <select
                                disabled={isSelf}
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                                className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50
                                  focus:outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer
                                  disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                              >
                                {ROLE_OPTIONS.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map(u => {
                const isSelf = u.id === adminUser?.id;
                const isUpdating = updating === u.id;
                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, hsl(175 84% 40%), hsl(190 80% 50%))' }}
                        >
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role as Role} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                      ) : (
                        <div className="relative">
                          <select
                            disabled={isSelf}
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value as Role)}
                            className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50
                              focus:outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer
                              disabled:cursor-not-allowed disabled:opacity-40 font-medium"
                          >
                            {ROLE_OPTIONS.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
