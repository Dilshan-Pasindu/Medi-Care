import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { appointmentService } from '../../services/appointment.service';
import { prescriptionService } from '../../services/prescription.service';
import { Appointment, Prescription } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import { Calendar, FileText, Search, Stethoscope, Sparkles, ArrowRight, Bot } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, prescRes] = await Promise.all([
          appointmentService.getAll(1, 5),
          prescriptionService.getAll(1, 5),
        ]);
        setAppointments(apptRes.data);
        setPrescriptions(prescRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState />;

  const upcomingAppointments = appointments.filter(a => a.status === 'BOOKED');
  const activePrescriptions = prescriptions.filter(p => p.status !== 'DISPENSED' && p.status !== 'CANCELLED');

  const handleStartAIChat = () => {
    if (aiQuery.trim()) {
      navigate(`/patient/specialist?q=${encodeURIComponent(aiQuery.trim())}`);
    } else {
      navigate('/patient/specialist');
    }
  };

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Patient'}`}
        description="Manage your appointments, prescriptions, and specialist channeling"
      />

      {/* Gemini AI Health Assistant Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-primary rounded-2xl p-6 text-white mb-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>AI Doctor Finder • Powered by Gemini</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Not sure which doctor you should consult?
          </h2>
          <p className="text-blue-100 text-sm mb-5 leading-relaxed">
            Chat directly with our intelligent assistant. Describe your symptoms in everyday language, and we will analyze your condition, recommend the exact specialist, and show available doctors.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartAIChat();
                  }
                }}
                placeholder="e.g., I've had sudden dizziness and a throbbing migraine for 2 days..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
            </div>
            <button
              onClick={handleStartAIChat}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              <span>Ask AI Doctor</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
        />
        <StatCard
          title="Active Prescriptions"
          value={activePrescriptions.length}
          icon={FileText}
        />
        <StatCard
          title="Total Appointments"
          value={appointments.length}
          icon={Stethoscope}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link
          to="/patient/specialist"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Find Specialist</p>
              <p className="text-xs text-muted-foreground">AI chat & symptom recommendations</p>
            </div>
          </div>
        </Link>
        <Link
          to="/patient/appointments"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Book Appointment</p>
              <p className="text-xs text-muted-foreground">Schedule a visit with a doctor</p>
            </div>
          </div>
        </Link>
        <Link
          to="/patient/prescriptions"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">View Prescriptions</p>
              <p className="text-xs text-muted-foreground">Track your prescription status</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium">Upcoming Appointments</h2>
          </div>
          <div className="p-5">
            {upcomingAppointments.length === 0 ? (
              <EmptyState title="No upcoming appointments" description="Book an appointment to get started" />
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium">{appt.doctor_name}</p>
                      <p className="text-xs text-muted-foreground">{appt.specialist_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(appt.date)} at {formatTime(appt.time)}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-medium">Recent Prescriptions</h2>
          </div>
          <div className="p-5">
            {prescriptions.length === 0 ? (
              <EmptyState title="No prescriptions yet" description="Prescriptions from your doctor will appear here" />
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((presc) => (
                  <div key={presc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium">RX-{presc.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{presc.doctor_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(presc.created_at)}</p>
                    </div>
                    <StatusBadge status={presc.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
