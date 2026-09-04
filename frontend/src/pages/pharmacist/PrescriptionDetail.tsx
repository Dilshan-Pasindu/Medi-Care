import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge, StockStatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { ErrorState } from '../../components/shared/ErrorState';
import { prescriptionService } from '../../services/prescription.service';
import { Prescription } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function PrescriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [dispenseError, setDispenseError] = useState('');
  const [dispensed, setDispensed] = useState(false);

  useEffect(() => {
    loadPrescription();
  }, [id]);

  async function loadPrescription() {
    if (!id) return;
    try {
      const data = await prescriptionService.getById(id);
      setPrescription(data);
      if (data.status === 'DISPENSED') setDispensed(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDispense() {
    if (!id) return;
    setDispenseError('');
    setDispensing(true);

    try {
      await prescriptionService.dispense(id);
      setDispensed(true);
      loadPrescription();
    } catch (err: any) {
      setDispenseError(err.message || 'Failed to dispense');
    } finally {
      setDispensing(false);
    }
  }

  async function handleUpdateStatus(status: string) {
    if (!id) return;
    try {
      await prescriptionService.updateStatus(id, status);
      loadPrescription();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadPrescription} />;
  if (!prescription) return <ErrorState message="Prescription not found" />;

  const totalAmount = prescription.items?.reduce((sum, item) => {
    return sum + item.quantity * (item.price || 0);
  }, 0) || 0;

  return (
    <div>
      <button
        onClick={() => navigate('/pharmacist/dashboard')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <PageHeader
        title={`Prescription #RX-${prescription.id.slice(0, 8).toUpperCase()}`}
        description={`Created on ${formatDate(prescription.created_at)}`}
        actions={<StatusBadge status={prescription.status} />}
      />

      {dispensed && (
        <div className="mb-6 p-4 bg-success-light border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-medium text-success">Prescription Dispensed Successfully</p>
            <p className="text-xs text-green-700">Inventory has been updated automatically</p>
          </div>
        </div>
      )}

      {dispenseError && (
        <div className="mb-6 p-4 bg-danger-light border border-red-200 rounded-lg text-danger text-sm">{dispenseError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Patient Information</h3>
          <p className="text-sm font-medium">{prescription.patient_name}</p>
          {prescription.patient_phone && <p className="text-sm text-muted-foreground">{prescription.patient_phone}</p>}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Doctor Information</h3>
          <p className="text-sm font-medium">{prescription.doctor_name}</p>
          <p className="text-sm text-muted-foreground">{prescription.specialist_name}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-medium">Prescribed Medicines</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Medicine</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dosage</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Subtotal</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescription.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium">{item.medicine_name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm">{item.dosage} × {item.frequency}</p>
                    <p className="text-xs text-muted-foreground">{item.duration}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center text-sm font-medium">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-center text-sm">{item.stock_quantity}</td>
                  <td className="px-5 py-3.5 text-right text-sm">{item.price ? formatCurrency(item.price) : '—'}</td>
                  <td className="px-5 py-3.5 text-right text-sm font-medium">
                    {item.price ? formatCurrency(item.quantity * item.price) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {item.stock_quantity !== undefined && (
                      <StockStatusBadge stockQuantity={item.stock_quantity} minimumStock={10} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center justify-end gap-6">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-xl font-semibold text-primary">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {prescription.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Doctor's Instructions</h3>
          <p className="text-sm">{prescription.notes}</p>
        </div>
      )}

      {!dispensed && prescription.status !== 'CANCELLED' && (
        <div className="flex items-center gap-3">
          {prescription.status === 'SENT_TO_PHARMACY' && (
            <button
              onClick={() => handleUpdateStatus('PROCESSING')}
              className="px-5 py-2.5 bg-gray-100 text-foreground text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Start Processing
            </button>
          )}
          <button
            onClick={handleDispense}
            disabled={dispensing}
            className="px-5 py-2.5 bg-success text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {dispensing ? <><Loader2 className="h-4 w-4 animate-spin" /> Dispensing...</> : <><CheckCircle className="h-4 w-4" /> Dispense Prescription</>}
          </button>
        </div>
      )}
    </div>
  );
}
