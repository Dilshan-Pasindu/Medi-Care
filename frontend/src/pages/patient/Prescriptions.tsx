import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { prescriptionService } from '../../services/prescription.service';
import { Prescription } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { FileText, X } from 'lucide-react';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, [page]);

  async function loadPrescriptions() {
    try {
      const res = await prescriptionService.getAll(page, 10);
      setPrescriptions(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function viewPrescription(id: string) {
    setDetailLoading(true);
    try {
      const presc = await prescriptionService.getById(id);
      setSelectedPrescription(presc);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="My Prescriptions"
        description="View your e-prescriptions and their status"
      />

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-base font-medium">E-Prescription</h2>
              <button onClick={() => setSelectedPrescription(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Prescription ID</p>
                  <p className="text-sm font-medium">RX-{selectedPrescription.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <StatusBadge status={selectedPrescription.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="text-sm font-medium">{selectedPrescription.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="text-sm font-medium">{selectedPrescription.doctor_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Specialty</p>
                  <p className="text-sm">{selectedPrescription.specialist_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{formatDate(selectedPrescription.created_at)}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-muted-foreground mb-3">Prescribed Medicines</p>
                <div className="space-y-3">
                  {selectedPrescription.items?.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">{item.medicine_name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>{item.dosage} × {item.frequency}</span>
                        <span>•</span>
                        <span>{item.duration}</span>
                      </div>
                      {item.price && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedPrescription.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-muted-foreground">Doctor's Instructions</p>
                  <p className="text-sm mt-1">{selectedPrescription.notes}</p>
                </div>
              )}

              {selectedPrescription.total_amount > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-lg font-semibold text-primary">{formatCurrency(selectedPrescription.total_amount)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prescription</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Doctor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8">
                    <EmptyState title="No prescriptions" description="Prescriptions from your doctor will appear here" />
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
                    <td className="px-5 py-3.5 text-sm">{presc.doctor_name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(presc.created_at)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium">{presc.total_amount > 0 ? formatCurrency(presc.total_amount) : '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={presc.status} /></td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => viewPrescription(presc.id)}
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
    </div>
  );
}
