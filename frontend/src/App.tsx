import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Login from './pages/Login';
import PatientDashboard from './pages/patient/PatientDashboard';
import SpecialistFinder from './pages/patient/SpecialistFinder';
import Appointments from './pages/patient/Appointments';
import PatientPrescriptions from './pages/patient/Prescriptions';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AppointmentDetail from './pages/doctor/AppointmentDetail';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import PrescriptionDetail from './pages/pharmacist/PrescriptionDetail';
import PharmacistPrescriptions from './pages/pharmacist/PharmacistPrescriptions';
import Inventory from './pages/pharmacist/Inventory';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const routes: Record<string, string> = {
    PATIENT: '/patient/dashboard',
    DOCTOR: '/doctor/dashboard',
    PHARMACIST: '/pharmacist/dashboard',
  };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route element={<DashboardLayout allowedRoles={['PATIENT']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/specialist" element={<SpecialistFinder />} />
            <Route path="/patient/appointments" element={<Appointments />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
          </Route>

          <Route element={<DashboardLayout allowedRoles={['DOCTOR']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments/:id" element={<AppointmentDetail />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
          </Route>

          <Route element={<DashboardLayout allowedRoles={['PHARMACIST']} />}>
            <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
            <Route path="/pharmacist/prescriptions" element={<PharmacistPrescriptions />} />
            <Route path="/pharmacist/prescriptions/:id" element={<PrescriptionDetail />} />
            <Route path="/pharmacist/inventory" element={<Inventory />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
