// Database types for the medical practice management system

export type AppRole = 'clinic_admin' | 'provider' | 'reception' | 'patient';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  clinic_type: string;
  logo_url: string | null;
  primary_color: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  subscription_status: string;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  clinic_id: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  clinic_id: string | null;
  created_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  blood_type: string | null;
  address: string | null;
  city: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  avatar_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientAllergy {
  id: string;
  patient_id: string;
  allergy_name: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string | null;
  created_at: string;
}

export interface PatientMedication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  prescribing_doctor: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface PatientMedicalHistory {
  id: string;
  patient_id: string;
  condition: string;
  diagnosis_date: string | null;
  status: 'active' | 'resolved' | 'chronic';
  notes: string | null;
  created_at: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'telemedicine';

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  provider_id: string | null;
  title: string;
  description: string | null;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  telemedicine_link: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient?: Patient;
  provider?: Profile;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'esewa' | 'khalti' | 'insurance' | 'other';

export interface Invoice {
  id: string;
  clinic_id: string;
  patient_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  patient?: Patient;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  clinic_id: string;
  invoice_id: string;
  patient_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_number: string | null;
  proof_url: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface InventoryCategory {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  clinic_id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  description: string | null;
  unit: string;
  quantity: number;
  min_quantity: number;
  unit_cost: number;
  selling_price: number;
  expiry_date: string | null;
  supplier_name: string | null;
  supplier_contact: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: InventoryCategory;
}

export interface ShowcasePortfolio {
  id: string;
  clinic_id: string;
  title: string;
  description: string | null;
  category: string;
  before_image_url: string | null;
  after_image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface ShowcaseTestimonial {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_photo_url: string | null;
  content: string;
  rating: number;
  treatment_type: string | null;
  is_approved: boolean;
  is_published: boolean;
  created_at: string;
}

export interface ShowcaseService {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  benefits: string[] | null;
  price_range: string | null;
  duration: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  clinic_id: string;
  profile_id: string | null;
  name: string;
  title: string;
  specialization: string | null;
  qualifications: string[] | null;
  bio: string | null;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Insert types
export type PatientInsert = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient' | 'provider'>;
export type InvoiceInsert = Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'patient' | 'items' | 'payments'>;
export type PaymentInsert = Omit<Payment, 'id' | 'created_at'>;
export type InventoryItemInsert = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'category'>;
