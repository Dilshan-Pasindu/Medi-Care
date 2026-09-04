import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { StockStatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { medicineService, MedicinePayload } from '../../services/medicine.service';
import { Medicine } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import {
  Search, Plus, Pencil, Trash2, X, FlaskConical,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const EMPTY_FORM: MedicinePayload = {
  name: '',
  category: '',
  price: 0,
  stock_quantity: 0,
  minimum_stock: 10,
  expiry_date: '',
};

const CATEGORIES = [
  'Analgesic', 'Antibiotic', 'Antihistamine', 'Anti-inflammatory', 'Antacid',
  'Antidiabetic', 'Antihypertensive', 'Bronchodilator', 'Supplement',
  'Topical Anti-inflammatory', 'Other',
];

// ─── Medicine Form Modal ─────────────────────────────────────────────────────
function MedicineModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit';
  initial?: Medicine;
  onClose: () => void;
  onSaved: (m: Medicine) => void;
}) {
  const [form, setForm] = useState<MedicinePayload>(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          price: initial.price,
          stock_quantity: initial.stock_quantity,
          minimum_stock: initial.minimum_stock,
          expiry_date: initial.expiry_date
            ? initial.expiry_date.split('T')[0]
            : '',
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (key: keyof MedicinePayload, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Medicine name is required.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }
    if (form.price < 0) { setError('Price cannot be negative.'); return; }
    if (form.stock_quantity < 0) { setError('Stock quantity cannot be negative.'); return; }
    if (form.minimum_stock < 0) { setError('Minimum stock cannot be negative.'); return; }

    setLoading(true);
    try {
      const payload: MedicinePayload = {
        ...form,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        minimum_stock: Number(form.minimum_stock),
        expiry_date: form.expiry_date || undefined,
      };
      const saved = mode === 'add'
        ? await medicineService.create(payload)
        : await medicineService.update(initial!.id, payload);
      onSaved(saved);
    } catch (err: any) {
      setError(err.message || 'Failed to save medicine.');
    } finally {
      setLoading(false);
    }
  };

  const labelCls = 'block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1';
  const inputCls =
    'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 ' +
    'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeInUp_0.2s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50">
              <FlaskConical className="h-5 w-5 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'add' ? 'Add New Medicine' : 'Edit Medicine'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className={labelCls}>Medicine Name <span className="text-red-500 normal-case font-normal">*</span></label>
            <input ref={firstRef} type="text" value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputCls} placeholder="e.g. Paracetamol 500mg" required />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category <span className="text-red-500 normal-case font-normal">*</span></label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className={inputCls} required>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Price (LKR) <span className="text-red-500 normal-case font-normal">*</span></label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={inputCls} placeholder="0.00" required />
            </div>
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input type="date" value={form.expiry_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => set('expiry_date', e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Stock + Min Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Stock Quantity <span className="text-red-500 normal-case font-normal">*</span></label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={(e) => set('stock_quantity', e.target.value)}
                className={inputCls} placeholder="0" required />
            </div>
            <div>
              <label className={labelCls}>Minimum Stock <span className="text-red-500 normal-case font-normal">*</span></label>
              <input type="number" min="0" value={form.minimum_stock}
                onChange={(e) => set('minimum_stock', e.target.value)}
                className={inputCls} placeholder="10" required />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))' }}>
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : <><CheckCircle2 className="h-4 w-4" /> {mode === 'add' ? 'Add Medicine' : 'Save Changes'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────
function DeleteDialog({
  medicine,
  onClose,
  onDeleted,
}: {
  medicine: Medicine;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await medicineService.delete(medicine.id);
      onDeleted(medicine.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete medicine.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeInUp_0.2s_ease]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-50">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Delete Medicine</h2>
        </div>
        <p className="text-sm text-slate-600 mb-2">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{medicine.name}</span>?
        </p>
        <p className="text-xs text-slate-400 mb-5">This action cannot be undone.</p>
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</> : <><Trash2 className="h-4 w-4" /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast notification ──────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium animate-[slideUp_0.3s_ease] ${
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main Inventory Page ─────────────────────────────────────────────────────
export default function Inventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadMedicines();
  }, [page, searchQuery]);

  async function loadMedicines() {
    setLoading(true);
    try {
      const res = searchQuery
        ? await medicineService.search(searchQuery, page, 10)
        : await medicineService.getAll(page, 10);
      setMedicines(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') =>
    setToast({ message, type });

  const handleSaved = (saved: Medicine) => {
    setMedicines((prev) => {
      const exists = prev.find((m) => m.id === saved.id);
      return exists
        ? prev.map((m) => (m.id === saved.id ? saved : m))
        : [saved, ...prev];
    });
    setShowAdd(false);
    setEditTarget(null);
    showToast(editTarget ? 'Medicine updated successfully.' : 'Medicine added successfully.');
  };

  const handleDeleted = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    setDeleteTarget(null);
    showToast('Medicine deleted successfully.');
  };

  return (
    <div>
      <PageHeader
        title="Medicine Inventory"
        description="Manage and track medicine stock levels"
      />

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Search medicines…"
          />
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ background: 'linear-gradient(135deg, hsl(175 84% 28%), hsl(190 80% 38%))' }}
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Stock</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10">
                      <EmptyState title="No medicines found" description="Click 'Add Medicine' to add your first medicine." />
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{med.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-sm font-bold ${
                          med.stock_quantity === 0 ? 'text-red-600' :
                          med.stock_quantity <= med.minimum_stock ? 'text-yellow-600' :
                          'text-slate-800'
                        }`}>
                          {med.stock_quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm text-slate-500">{med.minimum_stock}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-medium text-slate-700">{formatCurrency(med.price)}</td>
                      <td className="px-5 py-3.5 text-center text-sm text-slate-500">
                        {med.expiry_date ? formatDate(med.expiry_date) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <StockStatusBadge stockQuantity={med.stock_quantity} minimumStock={med.minimum_stock} />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTarget(med)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-all"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(med)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <MedicineModal mode="add" onClose={() => setShowAdd(false)} onSaved={handleSaved} />
      )}
      {editTarget && (
        <MedicineModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />
      )}
      {deleteTarget && (
        <DeleteDialog medicine={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
