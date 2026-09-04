import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Stethoscope,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Activity,
  ArrowRight,
  FlaskConical,
  ChevronRight,
  Shield,
  Users,
  ShieldCheck,
} from 'lucide-react';

type StaffRole = 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

const ROLE_CONFIG: Record<
  StaffRole,
  {
    label: string;
    subtitle: string;
    accentFrom: string;
    accentTo: string;
    panelFrom: string;
    panelTo: string;
    icon: React.ElementType;
    description: string;
    features: string[];
    emailPlaceholder: string;
  }
> = {
  DOCTOR: {
    label: 'Doctor',
    subtitle: 'Clinical Portal',
    accentFrom: 'hsl(220 90% 30%)',
    accentTo: 'hsl(250 80% 45%)',
    panelFrom: 'hsl(220 90% 12%)',
    panelTo: 'hsl(250 80% 20%)',
    icon: Stethoscope,
    description: 'Manage patient appointments, issue digital prescriptions, and access comprehensive medical records.',
    features: ['View & manage appointments', 'Issue digital prescriptions', 'Patient medical history'],
    emailPlaceholder: 'doctor@medicare.lk',
  },
  PHARMACIST: {
    label: 'Pharmacist',
    subtitle: 'Pharmacy Portal',
    accentFrom: 'hsl(175 84% 20%)',
    accentTo: 'hsl(155 70% 32%)',
    panelFrom: 'hsl(175 84% 8%)',
    panelTo: 'hsl(155 70% 15%)',
    icon: FlaskConical,
    description: 'Process incoming prescriptions, manage medicine inventory, and track dispensed items.',
    features: ['Process prescriptions', 'Manage inventory', 'Track dispensing history'],
    emailPlaceholder: 'pharmacist@medicare.lk',
  },
  ADMIN: {
    label: 'Admin',
    subtitle: 'Admin Console',
    accentFrom: 'hsl(340 85% 30%)',
    accentTo: 'hsl(355 75% 45%)',
    panelFrom: 'hsl(340 85% 10%)',
    panelTo: 'hsl(355 75% 18%)',
    icon: ShieldCheck,
    description: 'Full system access — manage users, doctors, pharmacists, and platform-wide settings.',
    features: ['Manage users & roles', 'System configuration', 'Platform analytics & reports'],
    emailPlaceholder: 'admin@medicare.lk',
  },
};

export default function StaffLogin() {
  const [selectedRole, setSelectedRole] = useState<StaffRole>('DOCTOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const cfg = ROLE_CONFIG[selectedRole];
  const RoleIcon = cfg.icon;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRoleSwitch = (role: StaffRole) => {
    if (role === selectedRole) return;
    setSelectedRole(role);
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      const routes: Record<string, string> = {
        DOCTOR: '/doctor/dashboard',
        PHARMACIST: '/pharmacist/dashboard',
        ADMIN: '/admin/dashboard',
      };
      navigate(routes[selectedRole] || '/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white ' +
    'transition-all duration-200 placeholder:text-slate-400';

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: `linear-gradient(135deg, ${cfg.panelFrom} 0%, ${cfg.panelTo} 100%)`,
        transition: 'background 0.5s ease',
      }}
    >
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Animated glow blobs */}
        <div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-10 animate-pulse"
          style={{ background: `radial-gradient(circle, ${cfg.accentTo} 0%, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full opacity-8"
          style={{ background: `radial-gradient(circle, ${cfg.accentFrom} 0%, transparent 70%)` }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-white/15">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white tracking-tight">MediCare</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400/80 tracking-widest uppercase">
                Staff Portal
              </span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 mb-2"
            style={{ transition: 'all 0.4s ease' }}
          >
            <RoleIcon className="h-4 w-4 text-white/80" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              {cfg.label} Access
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight">
            {cfg.label}
            <br />
            <span
              className="text-transparent"
              style={{
                background: `linear-gradient(90deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'brightness(2)',
              }}
            >
              {cfg.subtitle}
            </span>
          </h2>
          <p className="text-white/55 text-base leading-relaxed max-w-xs">{cfg.description}</p>

          <div className="space-y-3 mt-4">
            {cfg.features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/10">
                  <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-white/70 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="text-sm text-white/35 italic border-l-2 border-white/15 pl-4">
            "Healthcare excellence powered by technology"
          </blockquote>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-white/15">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MediCare</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Card Top */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Sign In</h1>
              <p className="text-sm text-slate-500 mt-1">
                Select your role and sign in to access your portal
              </p>

              {/* ── Role Switcher ── */}
              <div className="mt-5 p-1.5 bg-slate-100 rounded-2xl flex gap-1.5">
                {(Object.keys(ROLE_CONFIG) as StaffRole[]).map((role) => {
                  const isActive = selectedRole === role;
                  const RoleIco = ROLE_CONFIG[role].icon;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSwitch(role)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'text-white shadow-lg scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                      }`}
                      style={
                        isActive
                          ? {
                              background: `linear-gradient(135deg, ${ROLE_CONFIG[role].accentFrom}, ${ROLE_CONFIG[role].accentTo})`,
                            }
                          : {}
                      }
                    >
                      <RoleIco className="h-4 w-4" />
                      {ROLE_CONFIG[role].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-8 py-6">
              {/* Error */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Role Badge */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <RoleIcon className="h-3.5 w-3.5" />
                  <span>Signing in as {cfg.label}</span>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder={cfg.emailPlaceholder}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Sign In as {cfg.label}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Patient login link */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  Are you a patient?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-0.5 transition-colors"
                  >
                    <Users className="h-3 w-3" />
                    &nbsp;Patient Login
                  </Link>
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3 text-teal-500" />
                Protected by 256-bit JWT &amp; Supabase PostgreSQL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
