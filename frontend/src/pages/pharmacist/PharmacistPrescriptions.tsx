import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { prescriptionService } from '../../services/prescription.service';
import { Prescription } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { FileText } from 'lucide-react';

export default function PharmacistPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  useEffect(() => {
    loadPrescriptions();
  }, [page, filter]);

  async function loadPrescriptions() {
    setLoading(true);
    try {
      const res = await prescriptionService.getAll(page, 10, filter === 'pending' ? 'pending' : undefined);
      setPrescriptions(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        description="View and process incoming prescriptions"
      />

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setFilter('pending'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'pending' ? 'bg-primary text-white' : 'bg-white text-foreground border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-white text-foreground border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Prescriptions
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prescription</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Doctor</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8">
                      <EmptyState
                        title={filter === 'pending' ? 'No pending prescriptions' : 'No prescriptions'}
                        description={filter === 'pending' ? 'All prescriptions have been processed' : 'No prescriptions available'}
                      />
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((presc) => (
                    <tr key={presc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">RX-{presc.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm">{presc.patient_name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{presc.doctor_name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(presc.created_at)}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-medium">{presc.total_amount > 0 ? formatCurrency(presc.total_amount) : '—'}</td>
                      <td className="px-5 py-3.5 text-center"><StatusBadge status={presc.status} /></td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => navigate(`/pharmacist/prescriptions/${presc.id}`)}
                          className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
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
      )}
    </div>
  );
}
