import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge, StockStatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { ErrorState } from '../../components/shared/ErrorState';
import { appointmentService } from '../../services/appointment.service';
import { prescriptionService } from '../../services/prescription.service';
import { medicineService } from '../../services/medicine.service';
import { Appointment, Medicine } from '../../types';
import { formatDate, formatTime, formatCurrency } from '../../lib/utils';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  Loader2, 
  Send, 
  Pill, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  X,
  FileCheck2,
  Package,
  Layers,
  Calendar
} from 'lucide-react';

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  category: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  price: number;
  stockQuantity: number;
}

const DOSAGE_PRESETS = ['500mg', '250mg', '1 tablet', '2 tablets', '5ml (1 tsp)', '10ml (2 tsp)', '1 puff'];
const FREQUENCY_PRESETS = ['OD (Once daily)', 'BD (Twice daily)', 'TDS (3x daily)', 'QDS (4x daily)', 'PRN (As needed)'];
const DURATION_PRESETS = ['3 days', '5 days', '7 days', '14 days', '30 days'];
const INSTRUCTION_SNIPPETS = [
  'Take after meals with plenty of water.',
  'Complete full prescribed antibiotic course.',
  'Avoid driving or heavy machinery if drowsy.',
  'Take once at night before sleep.',
  'Inhale 2 puffs when experiencing acute breathlessness.'
];

const MEDICINE_CATEGORIES = [
  'All',
  'Analgesic',
  'Antibiotic',
  'Anti-inflammatory',
  'Antacid',
  'Antihistamine',
  'Antidiabetic',
  'Antihypertensive',
  'Bronchodilator'
];

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Prescription creation
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdSuccess, setCreatedSuccess] = useState(false);

  // Medicine search & category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadAppointment();
    loadInitialMedicines();
  }, [id]);

  async function loadAppointment() {
    if (!id) return;
    try {
      const data = await appointmentService.getById(id);
      setAppointment(data);
      setNotes(data.notes || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialMedicines() {
    try {
      const res = await medicineService.getAll(1, 20);
      setAllMedicines(res.data);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveNotes() {
    if (!id) return;
    setSavingNotes(true);
    try {
      await appointmentService.updateNotes(id, notes);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  }

  const filterMedicines = useCallback((query: string, category: string) => {
    let list = allMedicines;
    if (category !== 'All') {
      list = list.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.category.toLowerCase().includes(q)
      );
    }
    setSearchResults(list);
  }, [allMedicines]);

  const handleSearchMedicine = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      filterMedicines('', selectedCategory);
      return;
    }
    setSearching(true);
    try {
      const res = await medicineService.search(q, 1, 15);
      let list = res.data;
      if (selectedCategory !== 'All') {
        list = list.filter(m => m.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      }
      setSearchResults(list);
    } catch (err) {
      console.error(err);
      filterMedicines(q, selectedCategory);
    } finally {
      setSearching(false);
    }
  }, [selectedCategory, filterMedicines]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterMedicines(searchQuery, category);
  };

  function addMedicine(medicine: Medicine) {
    if (medicine.stock_quantity <= 0) return;
    if (prescriptionItems.find(i => i.medicineId === medicine.id)) return;

    setPrescriptionItems(prev => [
      ...prev,
      {
        medicineId: medicine.id,
        medicineName: medicine.name,
        category: medicine.category,
        quantity: 1,
        dosage: '1 tablet',
        frequency: 'BD (Twice daily)',
        duration: '5 days',
        price: Number(medicine.price),
        stockQuantity: medicine.stock_quantity,
      },
    ]);
  }

  function removeItem(medicineId: string) {
    setPrescriptionItems(prev => prev.filter(i => i.medicineId !== medicineId));
  }

  function updateItem(medicineId: string, field: keyof PrescriptionItem, value: any) {
    setPrescriptionItems(prev =>
      prev.map(i => i.medicineId === medicineId ? { ...i, [field]: value } : i)
    );
  }

  function adjustQuantity(medicineId: string, delta: number) {
    setPrescriptionItems(prev =>
      prev.map(i => {
        if (i.medicineId !== medicineId) return i;
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      })
    );
  }

  async function handleCreatePrescription() {
    if (!appointment || prescriptionItems.length === 0) return;
    
    // Check for stock errors
    const hasStockError = prescriptionItems.some(i => i.quantity > i.stockQuantity);
    if (hasStockError) {
      setCreateError('One or more prescribed quantities exceed current pharmacy stock. Please adjust quantities.');
      return;
    }

    setCreateError('');
    setCreating(true);

    try {
      await prescriptionService.create({
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        notes: prescriptionNotes,
        items: prescriptionItems.map(i => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
        })),
      });

      setCreatedSuccess(true);
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1200);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create prescription');
      setCreating(false);
    }
  }

  const totalAmount = prescriptionItems.reduce((sum, i) => sum + i.quantity * i.price, 0);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadAppointment} />;
  if (!appointment) return <ErrorState message="Appointment not found" />;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate('/doctor/dashboard')}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-5 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> 
        Back to Doctor Dashboard
      </button>

      <PageHeader
        title={`Patient Consultation: ${appointment.patient_name || 'Patient'}`}
        description={`Appointment #${appointment.id.slice(0, 8).toUpperCase()} • ${formatDate(appointment.date)} at ${formatTime(appointment.time)}`}
      />

      {/* Patient & Appointment Overview Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {appointment.patient_name?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{appointment.patient_name}</h3>
              <p className="text-xs text-muted-foreground">
                Phone: {appointment.patient_phone || 'N/A'} • DOB: {appointment.patient_dob ? formatDate(appointment.patient_dob) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={appointment.status} />
            <div className="text-xs text-muted-foreground bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              Channel: <span className="font-semibold text-foreground">{appointment.specialist_name}</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Reported Patient Symptoms:
          </p>
          <div className="flex flex-wrap gap-2">
            {appointment.symptoms && appointment.symptoms.length > 0 ? (
              appointment.symptoms.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-100"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No specific symptoms recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Notes Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>Doctor's Clinical Notes</span>
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
          placeholder="Enter clinical examination notes, vitals, diagnosis, and patient history..."
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="px-4 py-2 bg-gray-100 text-foreground text-xs font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {savingNotes ? 'Saving Notes...' : 'Save Clinical Notes'}
          </button>
        </div>
      </div>

      {/* E-Prescription Creation Trigger */}
      {!showPrescription && appointment.status === 'BOOKED' && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Generate E-Prescription</h3>
            <p className="text-xs text-muted-foreground">
              Search available pharmacy inventory, select dosages, and dispatch directly to the dispensary.
            </p>
          </div>
          <button
            onClick={() => setShowPrescription(true)}
            className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Prescribe Medicines</span>
          </button>
        </div>
      )}

      {/* COMPLETED STATUS NOTIFICATION */}
      {appointment.status === 'COMPLETED' && (
        <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3.5 text-emerald-800">
          <FileCheck2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Consultation & E-Prescription Completed</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              The prescription has been generated and dispatched to the pharmacy. The patient and pharmacist have real-time visibility.
            </p>
          </div>
        </div>
      )}

      {/* E-PRESCRIPTION CREATION WORKSPACE */}
      {showPrescription && (
        <div className="bg-white rounded-2xl border-2 border-primary/30 p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Create E-Prescription</h2>
                <p className="text-xs text-muted-foreground">
                  Search medicines, configure quantities, and dispatch to pharmacy
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrescription(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {createError && (
            <div className="mb-6 p-4 bg-danger-light border border-red-200 text-danger text-sm rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{createError}</span>
            </div>
          )}

          {createdSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2.5">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Prescription generated and sent to pharmacy! Redirecting...</span>
            </div>
          )}

          {/* MEDICINE SEARCH & BROWSE COMPONENT */}
          <div className="mb-8 p-5 bg-gray-50/80 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <span>Search & Select Medicine</span>
              </label>
              <span className="text-xs text-muted-foreground">
                Live Inventory Status Included
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchMedicine(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Search by medicine name (e.g. Paracetamol, Amoxicillin, Cetirizine)..."
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchMedicine('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
              {MEDICINE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Results Dropdown List */}
            <div className="max-h-64 overflow-y-auto bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 shadow-inner">
              {searching ? (
                <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Searching pharmacy inventory...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-5 text-center text-xs text-muted-foreground">
                  No medicines found matching "{searchQuery}" in {selectedCategory}
                </div>
              ) : (
                searchResults.map((med) => {
                  const isAdded = prescriptionItems.some(i => i.medicineId === med.id);
                  const isOutOfStock = med.stock_quantity <= 0;

                  return (
                    <div
                      key={med.id}
                      className="p-3.5 flex items-center justify-between hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                          <Pill className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{med.name}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                              {med.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Price: <span className="font-semibold text-foreground">{formatCurrency(med.price)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <StockStatusBadge stockQuantity={med.stock_quantity} minimumStock={med.minimum_stock} />
                          <span className="block text-[11px] text-muted-foreground mt-0.5">
                            {med.stock_quantity} units left
                          </span>
                        </div>

                        <button
                          onClick={() => addMedicine(med)}
                          disabled={isAdded || isOutOfStock}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-primary-600 shadow-xs'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Added
                            </>
                          ) : isOutOfStock ? (
                            'Out of Stock'
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PRESCRIPTION ITEMS CONFIGURATION */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Prescribed Medicines List ({prescriptionItems.length})</span>
              </h3>
              {prescriptionItems.length > 0 && (
                <button
                  onClick={() => setPrescriptionItems([])}
                  className="text-xs text-muted-foreground hover:text-danger transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {prescriptionItems.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No medicines added yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Search and click "+ Add" above to include medicines in this e-prescription
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptionItems.map((item, index) => {
                  const isStockWarning = item.quantity > item.stockQuantity;

                  return (
                    <div
                      key={item.medicineId}
                      className={`p-5 rounded-xl border transition-all ${
                        isStockWarning 
                          ? 'bg-red-50/50 border-red-300 ring-2 ring-red-100' 
                          : 'bg-white border-gray-200 shadow-xs hover:border-gray-300'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-start justify-between gap-4 pb-3 mb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{item.medicineName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {item.category} • Unit Price: {formatCurrency(item.price)} • Available: {item.stockQuantity} units
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Subtotal:</span>
                            <p className="text-sm font-bold text-primary">
                              {formatCurrency(item.quantity * item.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.medicineId)}
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stock Warning Alert */}
                      {isStockWarning && (
                        <div className="mb-3 p-2.5 bg-red-100/80 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800 font-semibold">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                          <span>
                            Quantity ({item.quantity}) exceeds available stock ({item.stockQuantity} units).
                          </span>
                        </div>
                      )}

                      {/* Form Fields: Quantity, Dosage, Frequency, Duration */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Quantity with +/- */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Quantity (Units)
                          </label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(item.medicineId, -1)}
                              className="w-9 h-9 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItem(item.medicineId, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full h-9 border border-gray-300 text-center text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={() => adjustQuantity(item.medicineId, 1)}
                              className="w-9 h-9 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Dosage */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) => updateItem(item.medicineId, 'dosage', e.target.value)}
                            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g. 500mg, 1 tablet"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {DOSAGE_PRESETS.slice(0, 3).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => updateItem(item.medicineId, 'dosage', d)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary transition-colors"
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={item.frequency}
                            onChange={(e) => updateItem(item.medicineId, 'frequency', e.target.value)}
                            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g. BD (Twice daily)"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {FREQUENCY_PRESETS.slice(0, 3).map((f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => updateItem(item.medicineId, 'frequency', f)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary transition-colors"
                              >
                                {f.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={item.duration}
                            onChange={(e) => updateItem(item.medicineId, 'duration', e.target.value)}
                            className="w-full h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g. 5 days"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {DURATION_PRESETS.slice(0, 3).map((dur) => (
                              <button
                                key={dur}
                                type="button"
                                onClick={() => updateItem(item.medicineId, 'duration', dur)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary transition-colors"
                              >
                                {dur}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TOTAL ESTIMATION BANNER */}
          {prescriptionItems.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/40 rounded-xl border border-gray-200 flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Prescription Value
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculated using real-time pharmacy inventory pricing ({prescriptionItems.length} items)
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {/* DOCTOR INSTRUCTIONS & NOTES */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">
              Clinical Advice & Pharmacist Instructions
            </label>
            <textarea
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              placeholder="e.g., Take Paracetamol after meals. Rest for 3 days. Return for follow-up if fever persists..."
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-gray-500 py-0.5">Quick snippets:</span>
              {INSTRUCTION_SNIPPETS.map((snip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrescriptionNotes(prev => prev ? `${prev} ${snip}` : snip)}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  + {snip}
                </button>
              ))}
            </div>
          </div>

          {/* ACTION SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowPrescription(false)}
              disabled={creating}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreatePrescription}
              disabled={prescriptionItems.length === 0 || creating}
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Dispatching E-Prescription...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send E-Prescription to Pharmacy ({formatCurrency(totalAmount)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
