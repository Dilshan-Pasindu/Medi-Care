export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';
  patientId?: string;
  doctorId?: string;
  specialistId?: string;
  specialistName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface Specialist {
  id: string;
  name: string;
  description: string;
}

export interface Symptom {
  id: string;
  name: string;
}

export interface SpecialistRecommendation {
  id: string;
  name: string;
  description: string;
  score: number;
}

export interface Doctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  specialist_name: string;
  specialist_id?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  symptoms: string[];
  notes?: string;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  patient_dob?: string;
  doctor_name?: string;
  specialist_name?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  expiry_date: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  notes: string;
  status: 'CREATED' | 'SENT_TO_PHARMACY' | 'PROCESSING' | 'DISPENSED' | 'CANCELLED';
  total_amount: number;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_name?: string;
  specialist_name?: string;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  medicine_name?: string;
  price?: number;
  stock_quantity?: number;
  category?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PharmacyStats {
  pendingPrescriptions: number;
  dispensedToday: number;
  lowStockMedicines: number;
}

export interface AIChatAnalysis {
  reply: string;
  recommendedSpecialist: {
    id: string;
    name: string;
    description: string;
  } | null;
  identifiedSymptoms: string[];
  doctors: Doctor[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysis?: AIChatAnalysis;
}

