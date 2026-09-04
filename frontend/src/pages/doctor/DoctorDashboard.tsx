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
import { Calendar, Clock, Users, FileText, Phone, ArrowRight, RefreshCw } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadAppointments = async () => {
    try {
      // Load all appointments for this doctor (up to 50)
      const res = await appointmentService.getAll(1, 50);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  if (loading) return <LoadingState />;

  // Filter appointments according to active filter tab
  const filteredAppointments = appointments.filter((appt) => {
    if (activeFilter === 'today') {
      return appt.date === todayStr;
    }
    if (activeFilter === 'upcoming') {
      return appt.date >= todayStr && appt.status === 'BOOKED';
    }
    if (activeFilter === 'completed') {
      return appt.status === 'COMPLETED';
    }
    return true; // 'all'
  });

  const totalBooked = appointments.filter((a) => a.status === 'BOOKED').length;
  const todayCount = appointments.filter((a) => a.date === todayStr).length;
  const totalCompleted = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || 'Doctor'}`}
        description={user?.specialistName ? `${user.specialistName} — Patient Channeling Queue` : 'Patient Channeling Queue'}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 bg-white border border-gray-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Appointments" value={appointments.length} icon={Calendar} />
        <StatCard title="Today's Schedule" value={todayCount} icon={Clock} />
        <StatCard title="Pending Consultations" value={totalBooked} icon={Users} />
        <StatCard title="Completed" value={totalCompleted} icon={FileText} />
      </div>

      {/* Main Appointment Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Navigation Tabs */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'today'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Today ({todayCount})
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'upcoming'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Upcoming ({totalBooked})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFilter === 'completed'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Completed ({totalCompleted})
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredAppointments.length} patient{filteredAppointments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No appointments found"
              description={
                activeFilter === 'today'
                  ? 'You have no appointments scheduled for today. Check "All Appointments" or "Upcoming".'
                  : 'No patient appointments match the selected filter.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* Left: Schedule Slot & Patient Info */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[72px] h-[64px] bg-primary-50 rounded-lg text-center p-1.5 border border-primary-100">
                    <span className="text-xs font-bold text-primary tracking-wide">
                      {formatTime(appt.time)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-0.5">
                      {formatDate(appt.date)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-slate-900">
                        {appt.patient_name || 'Patient'}
                      </h3>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      {appt.patient_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {appt.patient_phone}
                        </span>
                      )}
                      {appt.patient_dob && (
                        <span>DOB: {formatDate(appt.patient_dob)}</span>
                      )}
                    </div>

                    {appt.symptoms && appt.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {appt.symptoms.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {appt.status === 'BOOKED' ? 'Consult & Prescribe' : 'View Consultation'}
                    <ArrowRight className="h-3.5 w-3.5" />
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
