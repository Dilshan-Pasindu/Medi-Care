import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { prescriptionService } from '../../services/prescription.service';
import { Prescription, PharmacyStats } from '../../types';
import { formatDate } from '../../lib/utils';
import { ClipboardList, Package, CheckCircle, FileText } from 'lucide-react';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PharmacyStats | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

  async function loadData() {
    try {
      const [statsData, prescData] = await Promise.all([
        prescriptionService.getPharmacyStats(),
        prescriptionService.getAll(page, 10, 'pending'),
      ]);
      setStats(statsData);
      setPrescriptions(prescData.data);
      setTotalPages(prescData.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title={`Pharmacy Dashboard`}
        description={`Welcome, ${user?.name || 'Pharmacist'}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Pending Prescriptions" value={stats?.pendingPrescriptions || 0} icon={ClipboardList} />
        <StatCard title="Low Stock Medicines" value={stats?.lowStockMedicines || 0} icon={Package} />
        <StatCard title="Dispensed Today" value={stats?.dispensedToday || 0} icon={CheckCircle} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-medium">Incoming Prescriptions</h2>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No pending prescriptions" description="Prescriptions from doctors will appear here" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {prescriptions.map((presc) => (
              <div
                key={presc.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/pharmacist/prescriptions/${presc.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">RX-{presc.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {presc.patient_name} • Dr. {presc.doctor_name?.replace('Dr. ', '')}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(presc.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={presc.status} />
                  <span className="text-xs text-primary font-medium">View →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 px-5">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
