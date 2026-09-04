import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Stethoscope, Mail, Lock, User, Phone, Calendar, Loader2,
  CheckCircle2, AlertCircle, Activity, Heart, Shield, ArrowRight, Stethoscope as StethoscopeIcon,
} from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpDob, setSignUpDob] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!signInEmail.trim() || !EMAIL_REGEX.test(signInEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!signInPassword) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      await login(signInEmail.trim(), signInPassword);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!signUpName.trim() || signUpName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!signUpEmail.trim() || !EMAIL_REGEX.test(signUpEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (signUpPhone) {
      const cleanPhone = signUpPhone.replace(/[\s\-()]/g, '');
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        setError('Please enter a valid phone number (8-15 digits).');
        return;
      }
    }
    if (signUpDob) {
      const dob = new Date(signUpDob);
      if (isNaN(dob.getTime()) || dob >= new Date()) {
        setError('Date of birth must be a valid date in the past.');
        return;
      }
    }
    setLoading(true);
    try {
      await register({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        phone: signUpPhone.trim() || undefined,
        dateOfBirth: signUpDob || undefined,
      });
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all duration-200 placeholder:text-slate-400";

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'linear-gradient(135deg, hsl(175 84% 10%) 0%, hsl(190 80% 16%) 50%, hsl(200 70% 20%) 100%)',
      }}
    >
      {/* ── Left Panel (Hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, hsl(175 84% 60%) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full opacity-5 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />

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
                Health Portal
              </span>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Smart Healthcare
              <br />
              <span className="text-transparent" style={{
                background: 'linear-gradient(90deg, hsl(160 70% 60%), hsl(175 84% 70%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                At Your Fingertips
              </span>
            </h2>
            <p className="text-white/60 mt-3 text-base leading-relaxed max-w-xs">
              Connect with certified specialists, manage appointments, and receive digital prescriptions — all in one secure platform.
            </p>
          </div>

          {/* Feature Chips */}
          <div className="space-y-3">
            {[
              { icon: Heart, label: 'Find & book certified specialists instantly' },
              { icon: Calendar, label: 'Manage appointments in real-time' },
              { icon: Shield, label: 'Secure e-prescription management' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm text-white/70 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-sm text-white/40 italic border-l-2 border-white/20 pl-4">
            "Healthcare excellence powered by technology"
          </blockquote>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'signin' ? 'Welcome back' : 'Join MediCare'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {activeTab === 'signin'
                  ? 'Sign in to access your health portal'
                  : 'Create your free patient account today'}
              </p>

              {/* Tab Switcher */}
              <div className="flex gap-2 mt-5">
                {(['signin', 'signup'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => { setActiveTab(tab); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      activeTab === tab
                        ? 'text-white shadow-md'
                        : 'bg-slate-100 text-slate-500 hover:text-slate-700'
                    }`}
                    style={activeTab === tab ? {
                      background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))',
                    } : {}}
                  >
                    {tab === 'signin' ? 'Sign In' : 'Register'}
                  </button>
                ))}
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

              {/* Success */}
              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              {/* ── Sign In Form ── */}
              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. kasun@medicare.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className={inputClass}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))' }}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                    ) : (
                      <><span>Sign In to MediCare</span><ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              ) : (
                /* ── Sign Up Form ── */
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500 normal-case font-normal">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Jane Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500 normal-case font-normal">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. jane.doe@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Password <span className="text-red-500 normal-case font-normal">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className={inputClass}
                          placeholder="Min 6 chars"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Confirm <span className="text-red-500 normal-case font-normal">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={signUpConfirmPassword}
                          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                          className={inputClass}
                          placeholder="Re-enter"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          className={inputClass}
                          placeholder="0771234567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          value={signUpDob}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSignUpDob(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))' }}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>
                    ) : (
                      <><span>Create Patient Account</span><ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3 text-teal-500" />
                Protected by 256-bit JWT &amp; Supabase PostgreSQL
              </p>
              <p className="text-xs text-slate-500 text-center">
                Doctor or Pharmacist?{' '}
                <Link
                  to="/staff-login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-0.5 transition-colors"
                >
                  <StethoscopeIcon className="h-3 w-3" />
                  &nbsp;Staff Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
