import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { appointmentService } from '../../services/appointment.service';
import { specialistService } from '../../services/specialist.service';
import { Appointment, Doctor } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import { Calendar, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Appointments() {
  const location = useLocation();
  const bookingState = location.state as { doctorId?: string; doctorName?: string; specialistName?: string; symptoms?: string[] } | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBooking, setShowBooking] = useState(!!bookingState?.doctorId);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState(bookingState?.doctorId || '');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookSymptoms, setBookSymptoms] = useState<string[]>(bookingState?.symptoms || []);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, [page]);

  async function loadAppointments() {
    try {
      const res = await appointmentService.getAll(page, 10);
      setAppointments(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctors() {
    try {
      const docs = await specialistService.getDoctors();
      setDoctors(docs);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setBookError('');
    setSuccessMessage('');

    if (!selectedDoctor) {
      setBookError('Please select a doctor to channel.');
      return;
    }

    if (!bookDate || bookDate < todayStr) {
      setBookError('Please select today or a future date for your appointment.');
      return;
    }

    if (!bookTime) {
      setBookError('Please select an appointment time slot.');
      return;
    }

    setBooking(true);

    try {
      await appointmentService.create({
        doctorId: selectedDoctor,
        date: bookDate,
        time: bookTime,
        symptoms: bookSymptoms,
      });

      setSuccessMessage('Appointment booked successfully! Your doctor will see you in their consultation queue.');
      setShowBooking(false);
      setSelectedDoctor('');
      setBookDate('');
      setBookTime('');
      setBookSymptoms([]);
      setPage(1);
      loadAppointments();
    } catch (err: any) {
      setBookError(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  }

  const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="View and manage your appointments"
        actions={
          !showBooking && (
            <button
              onClick={() => {
                setShowBooking(true);
                setSuccessMessage('');
                setBookError('');
              }}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </button>
          )
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showBooking && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Book Doctor Appointment</h2>
              <p className="text-xs text-slate-500">Choose your specialist, date, and preferred time slot</p>
            </div>
            <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {bookError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <span>{bookError}</span>
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Doctor & Specialty <span className="text-red-500">*</span></label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialist_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  min={todayStr}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Slot <span className="text-red-500">*</span></label>
                <select
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {bookSymptoms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Associated Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {bookSymptoms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary text-xs rounded-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={booking}
                className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {booking ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming Booking...</> : 'Confirm Booking'}
              </button>
              <button
                type="button"
                onClick={() => setShowBooking(false)}
                className="px-4 py-2.5 bg-gray-100 text-slate-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Doctor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Specialty</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Symptoms</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8">
                    <EmptyState title="No appointments" description="Book your first appointment to get started" />
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{appt.doctor_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{appt.specialist_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {formatDate(appt.date)} at {formatTime(appt.time)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {appt.symptoms?.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 font-medium rounded">{s}</span>
                        ))}
                        {(appt.symptoms?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">+{appt.symptoms!.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={appt.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-200 px-5">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
