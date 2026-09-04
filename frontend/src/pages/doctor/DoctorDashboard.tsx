import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { appointmentService } from '../../services/appointment.service';
import { Appointment } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import {
  Calendar, Clock, Users, FileText, Phone, ArrowRight, RefreshCw,
  LayoutDashboard, User, Stethoscope, ChevronRight, AlertCircle,
} from 'lucide-react';

type FilterType = 'all' | 'today' | 'upcoming' | 'completed';

const filterLabels: Record<FilterType, string> = {
  all: 'All',
  today: "Today's",
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadAppointments = async () => {
    setFetchError(null);
    try {
      const res = await appointmentService.getAll(1, 200);
      setAppointments(res.data);
    } catch (err: any) {
      console.error('Error fetching doctor appointments:', err);
      setFetchError(err.message || 'Failed to load appointments. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadAppointments(); }, []);

  const handleRefresh = () => { setRefreshing(true); loadAppointments(); };

  if (loading) return <LoadingState message="Loading patient queue..." />;

  const filteredAppointments = appointments.filter((appt) => {
    if (activeFilter === 'today')    return appt.date === todayStr;
    if (activeFilter === 'upcoming') return appt.date >= todayStr && appt.status === 'BOOKED';
    if (activeFilter === 'completed') return appt.status === 'COMPLETED';
    return true;
  });

  const totalBooked    = appointments.filter((a) => a.status === 'BOOKED').length;
  const todayCount     = appointments.filter((a) => a.date === todayStr).length;
  const totalCompleted = appointments.filter((a) => a.status === 'COMPLETED').length;

  const filters: { key: FilterType; count: number }[] = [
    { key: 'all',       count: appointments.length },
    { key: 'today',     count: todayCount },
    { key: 'upcoming',  count: totalBooked },
    { key: 'completed', count: totalCompleted },
  ];

  return (
    <div className="page-container space-y-6">
      {/* ── API Error Banner ── */}
      {fetchError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to load appointments</p>
            <p className="text-red-700 mt-0.5">{fetchError}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-xs font-bold text-red-700 underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl text-white shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))' }}>
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-gradient-medical">{user?.name?.split(' ')[0] || 'Doctor'}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              {user?.specialistName
                ? `${user.specialistName} — Patient Channeling Queue`
                : 'Patient Channeling Queue'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-card disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 text-teal-500 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={appointments.length}
          icon={Calendar}
          accentColor="teal"
          description="All time"
        />
        <StatCard
          title="Today's Schedule"
          value={todayCount}
          icon={Clock}
          accentColor="cyan"
          description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        />
        <StatCard
          title="Pending Consultations"
          value={totalBooked}
          icon={Users}
          accentColor="blue"
          description="Awaiting your review"
        />
        <StatCard
          title="Completed"
          value={totalCompleted}
          icon={FileText}
          accentColor="emerald"
          description="Successfully treated"
        />
      </div>

      {/* ── Appointment Queue Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">

        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-teal-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Patient Queue</h2>
              <span className="text-xs text-slate-400 font-medium ml-1">
                ({filteredAppointments.length} patient{filteredAppointments.length !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Filter Tabs — horizontally scrollable on mobile */}
            <div className="overflow-x-auto pb-0.5 -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-visible">
              <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1 w-max sm:w-auto">
                {filters.map(({ key, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                      activeFilter === key
                        ? 'bg-white text-teal-700 shadow-sm border border-teal-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {filterLabels[key]}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeFilter === key ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Queue List */}
        {filteredAppointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description={
              activeFilter === 'today'
                ? 'You have no appointments scheduled for today.'
                : 'No patient appointments match the selected filter.'
            }
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredAppointments.map((appt, idx) => (
              <div
                key={appt.id}
                className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-teal-50/30 transition-all duration-200 group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Left: Time + Patient Info */}
                <div className="flex items-start gap-4">
                  {/* Time Slot */}
                  <div className="flex flex-col items-center justify-center min-w-[72px] py-3 px-2 rounded-xl text-center border"
                    style={{
                      background: 'linear-gradient(135deg, #edfafa, #d5f5f6)',
                      borderColor: '#afecec',
                    }}>
                    <span className="text-sm font-extrabold text-teal-700 tracking-tight">
                      {formatTime(appt.time)}
                    </span>
                    <div className="mt-1 h-px w-8 bg-teal-200" />
                    <span className="text-[10px] font-semibold text-teal-600/80 mt-1 leading-tight">
                      {formatDate(appt.date)}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(175 84% 35%), hsl(190 80% 45%))' }}>
                        {(appt.patient_name || 'P')[0].toUpperCase()}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {appt.patient_name || 'Patient'}
                      </h3>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 font-medium">
                      {appt.patient_phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {appt.patient_phone}
                        </span>
                      )}
                      {appt.patient_dob && (
                        <span className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-slate-400" />
                          DOB: {formatDate(appt.patient_dob)}
                        </span>
                      )}
                    </div>

                    {appt.symptoms && appt.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {appt.symptoms.map((s, i) => (
                          <span key={i}
                            className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 font-semibold rounded-lg border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Action */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button
                    onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm ${
                      appt.status === 'BOOKED'
                        ? 'text-white hover:shadow-md hover:-translate-y-0.5'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={appt.status === 'BOOKED' ? {
                      background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))',
                    } : {}}
                  >
                    {appt.status === 'BOOKED' ? 'Consult & Prescribe' : 'View Consultation'}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
